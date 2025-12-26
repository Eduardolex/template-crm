"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";
import { sendDealAutomationEmail } from "@/lib/email";

const dealSchema = z.object({
  title: z.string().min(1, "Title required"),
  valueCents: z.number().min(0),
  stageId: z.string().min(1, "Stage required"),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

export async function createDealAction(data: z.infer<typeof dealSchema>) {
  const { tenantId, userId } = await getTenantContext();

  // Get pipeline ID (MVP: one pipeline per tenant)
  const pipeline = await prisma.pipeline.findFirst({
    where: { tenantId },
  });

  if (!pipeline) {
    throw new Error("No pipeline found");
  }

  const validated = dealSchema.parse(data);

  const deal = await prisma.deal.create({
    data: {
      title: validated.title,
      valueCents: validated.valueCents,
      stageId: validated.stageId,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
      tenantId,
      pipelineId: pipeline.id,
      ownerUserId: userId,
    },
  });

  // Trigger stage automations
  await triggerStageAutomations(deal.id, validated.stageId);

  revalidatePath("/deals", "page");
  return { success: true, dealId: deal.id };
}

export async function updateDealAction(id: string, data: z.infer<typeof dealSchema>) {
  const { tenantId } = await getTenantContext();
  const validated = dealSchema.parse(data);

  // Get current stage to check if it changed
  const currentDeal = await prisma.deal.findUnique({
    where: { id, tenantId },
    select: { stageId: true },
  });

  // Update deal
  await prisma.deal.update({
    where: { id, tenantId },
    data: {
      title: validated.title,
      valueCents: validated.valueCents,
      stageId: validated.stageId,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
    },
  });

  // Trigger automations only if stage changed
  if (currentDeal && currentDeal.stageId !== validated.stageId) {
    await triggerStageAutomations(id, validated.stageId);
  }

  revalidatePath("/deals", "page");
  return { success: true };
}

export async function deleteDealAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.deal.delete({
    where: { id, tenantId },
  });

  revalidatePath("/deals", "page");
  return { success: true };
}

export async function moveDealToStageAction(dealId: string, stageId: string) {
  const { tenantId } = await getTenantContext();

  await prisma.deal.update({
    where: { id: dealId, tenantId },
    data: { stageId },
  });

  // Trigger stage automations
  await triggerStageAutomations(dealId, stageId);

  revalidatePath("/deals", "page");
  return { success: true };
}

/**
 * Trigger all automations assigned to a stage
 */
async function triggerStageAutomations(dealId: string, stageId: string) {
  const { tenantId } = await getTenantContext();

  // Fetch deal with all related data
  const deal = await prisma.deal.findUnique({
    where: { id: dealId, tenantId },
    include: {
      contact: true,
      company: true,
      stage: {
        include: {
          automations: {
            include: {
              automationTemplate: true,
            },
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  });

  if (!deal) return;

  // Trigger each enabled automation in order
  for (const stageAutomation of deal.stage.automations) {
    const template = stageAutomation.automationTemplate;
    if (template.enabled) {
      await triggerDealAutomation(deal, template, deal.contact, deal.company);
    }
  }
}

/**
 * Trigger automation for a new deal
 * In production, this would send an actual email via SendGrid, Resend, etc.
 * For now, we'll log it and could add a notification
 */
async function triggerDealAutomation(
  deal: any,
  template: any,
  contact: any,
  company: any
) {
  try {
    // Replace variables in the template
    let message = template.messageTemplate;

    // Replace contact name
    if (contact) {
      const contactName = `${contact.firstName} ${contact.lastName}`;
      message = message.replace(/{contact_name}/g, contactName);
    }

    // Replace company name
    if (company) {
      message = message.replace(/{company_name}/g, company.name || "");
    }

    // Replace deal title and value
    message = message.replace(/{deal_title}/g, deal.title || "");
    message = message.replace(/{deal_value}/g, `$${(deal.valueCents / 100).toFixed(2)}`);

    // Determine recipient
    const recipient = template.sendTo === "contact"
      ? contact?.email
      : template.customEmail;

    if (!recipient) {
      console.warn("No recipient email found for automation template:", template.id);
      return;
    }

    // Send email via Resend
    const result = await sendDealAutomationEmail({
      to: recipient,
      templateName: template.name,
      message,
      dealTitle: deal.title,
    });

    if (result.success) {
      console.log("✅ Deal automation email sent:", {
        templateName: template.name,
        recipient,
        dealId: deal.id,
      });

      // Optional: Create an activity record to track that automation was sent
      // await prisma.activity.create({
      //   data: {
      //     type: "note",
      //     body: `Automation sent: ${template.name} to ${recipient}`,
      //     tenantId: deal.tenantId,
      //     dealId: deal.id,
      //   },
      // });
    } else {
      console.error("❌ Deal automation email failed:", result.error);
      // Don't throw - allow deal stage change to succeed even if email fails
    }

  } catch (error) {
    console.error("Error triggering deal automation:", error);
    // Don't fail the deal creation if automation fails
  }
}
