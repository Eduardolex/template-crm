"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";

// Schema for notes
const noteSchema = z.object({
  body: z.string().min(1, "Note content required"),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
});

// Schema for calls
const callSchema = z.object({
  body: z.string().min(1, "Call notes required"),
  dueAt: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
});

// Note Actions
export async function createNoteAction(data: z.infer<typeof noteSchema>) {
  const { tenantId } = await getTenantContext();
  const validated = noteSchema.parse(data);

  await prisma.activity.create({
    data: {
      type: "note",
      body: validated.body,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      tenantId,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function updateNoteAction(
  id: string,
  data: z.infer<typeof noteSchema>
) {
  const { tenantId } = await getTenantContext();
  const validated = noteSchema.parse(data);

  await prisma.activity.update({
    where: { id, tenantId, type: "note" },
    data: {
      body: validated.body,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function deleteNoteAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.activity.delete({
    where: { id, tenantId, type: "note" },
  });

  revalidatePath("/activities");
  return { success: true };
}

// Call Actions
export async function createCallAction(data: z.infer<typeof callSchema>) {
  const { tenantId } = await getTenantContext();
  const validated = callSchema.parse(data);

  await prisma.activity.create({
    data: {
      type: "call",
      body: validated.body,
      dueAt: validated.dueAt ? new Date(validated.dueAt) : null,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      tenantId,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function updateCallAction(
  id: string,
  data: z.infer<typeof callSchema>
) {
  const { tenantId } = await getTenantContext();
  const validated = callSchema.parse(data);

  await prisma.activity.update({
    where: { id, tenantId, type: "call" },
    data: {
      body: validated.body,
      dueAt: validated.dueAt ? new Date(validated.dueAt) : null,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
    },
  });

  revalidatePath("/activities");
  return { success: true };
}

export async function deleteCallAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.activity.delete({
    where: { id, tenantId, type: "call" },
  });

  revalidatePath("/activities");
  return { success: true };
}
