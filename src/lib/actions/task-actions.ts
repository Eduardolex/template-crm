"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";

const taskSchema = z.object({
  body: z.string().min(1, "Task description required"),
  dueAt: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  assignedUserId: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
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
      tenantId,
    },
  });

  revalidatePath("/tasks");
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
    },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function deleteTaskAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.activity.delete({
    where: { id, tenantId },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTaskStatusAction(
  id: string,
  status: "todo" | "in_progress" | "done"
) {
  const { tenantId } = await getTenantContext();

  await prisma.activity.update({
    where: { id, tenantId, type: "task" },
    data: {
      status,
      completedAt: status === "done" ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  return { success: true };
}
