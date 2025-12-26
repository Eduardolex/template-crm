"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";
import { sendTaskAutomationEmail } from "@/lib/email";

const taskSchema = z.object({
  body: z.string().min(1, "Task description required"),
  dueAt: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  assignedUserId: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
  automationTemplateId: z.string().optional(),
});

export async function createTaskAction(data: z.infer<typeof taskSchema>) {
  const { tenantId, userId } = await getTenantContext();
  const validated = taskSchema.parse(data);

  await prisma.activity.create({
    data: {
      type: "task",
      body: validated.body,
      dueAt: validated.dueAt ? new Date(validated.dueAt) : null,
      status: validated.status,
      assignedUserId: validated.assignedUserId || userId,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      automationTemplateId: validated.automationTemplateId || null,
      tenantId,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function updateTaskAction(
  id: string,
  data: z.infer<typeof taskSchema>
) {
  const { tenantId } = await getTenantContext();
  const validated = taskSchema.parse(data);

  await prisma.activity.update({
    where: { id, tenantId, type: "task" },
    data: {
      body: validated.body,
      dueAt: validated.dueAt ? new Date(validated.dueAt) : null,
      status: validated.status,
      assignedUserId: validated.assignedUserId || null,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      automationTemplateId: validated.automationTemplateId || null,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function deleteTaskAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.activity.delete({
    where: { id, tenantId },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function updateTaskStatusAction(
  id: string,
  status: "todo" | "in_progress" | "done"
) {
  console.log("🎯 Updating task status:", { id, status });

  const { tenantId } = await getTenantContext();

  // Fetch the task with related data
  const task = await prisma.activity.findUnique({
    where: { id, tenantId, type: "task" },
    include: {
      automationTemplate: true,
      contact: true,
    },
  });

  // Update task status
  await prisma.activity.update({
    where: { id, tenantId, type: "task" },
    data: {
      status,
      completedAt: status === "done" ? new Date() : null,
    },
  });

  // Trigger automation if task is marked as done and has an automation template
  if (status === "done" && task?.automationTemplate && task.automationTemplate.enabled) {
    console.log("🚀 Triggering task automation:", task.automationTemplate.name);
    await triggerAutomation(task, task.automationTemplate, task.contact);
  }
  revalidatePath("/activities");
  return { success: true };
}

/**
 * Trigger automation for a completed task
 * In production, this would send an actual email via SendGrid, Resend, etc.
 * For now, we'll log it and could add a notification
 */
async function triggerAutomation(
  task: any,
  template: any,
  contact: any
) {
  try {
    // Replace variables in the template
    let message = template.messageTemplate;

    // Replace contact name
    if (contact) {
      const contactName = `${contact.firstName} ${contact.lastName}`;
      message = message.replace(/{contact_name}/g, contactName);
    }

    // Replace task title and body
    message = message.replace(/{task_title}/g, task.body || "");
    message = message.replace(/{task_body}/g, task.body || "");

    // Determine recipient
    const recipient = template.sendTo === "contact"
      ? contact?.email
      : template.customEmail;

    if (!recipient) {
      console.warn("⚠️ No recipient email found for automation template:", template.id);
      return;
    }

    // Send email via Resend
    const result = await sendTaskAutomationEmail({
      to: recipient,
      templateName: template.name,
      message,
    });

    if (result.success) {
      console.log("✅ Task automation email sent:", {
        template: template.name,
        recipient,
        emailId: result.data?.id,
      });

      // Optional: Create an activity record to track that automation was sent
      // await prisma.activity.create({
      //   data: {
      //     type: "note",
      //     body: `Automation sent: ${template.name} to ${recipient}`,
      //     tenantId: task.tenantId,
      //     contactId: contact?.id,
      //   },
      // });
    } else {
      console.error("❌ Task automation email failed:", result.error);
      // Don't throw - allow task completion to succeed even if email fails
    }

  } catch (error) {
    console.error("❌ Error triggering automation:", error);
    // Don't fail the task completion if automation fails
  }
}
