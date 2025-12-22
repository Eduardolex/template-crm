"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";

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

  revalidatePath("/deals", "page");
  return { success: true, dealId: deal.id };
}

export async function updateDealAction(id: string, data: z.infer<typeof dealSchema>) {
  const { tenantId } = await getTenantContext();
  const validated = dealSchema.parse(data);

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

  revalidatePath("/deals", "page");
  return { success: true };
}
