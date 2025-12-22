"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function createContactAction(data: z.infer<typeof contactSchema>) {
  const { tenantId, userId } = await getTenantContext();
  const validated = contactSchema.parse(data);

  await prisma.contact.create({
    data: {
      ...validated,
      email: validated.email || null,
      tenantId,
      ownerUserId: userId,
    },
  });

  revalidatePath("/contacts");
  return { success: true };
}

export async function updateContactAction(id: string, data: z.infer<typeof contactSchema>) {
  const { tenantId } = await getTenantContext();
  const validated = contactSchema.parse(data);

  await prisma.contact.update({
    where: { id, tenantId },
    data: {
      ...validated,
      email: validated.email || null,
    },
  });

  revalidatePath("/contacts");
  return { success: true };
}

export async function deleteContactAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.contact.delete({
    where: { id, tenantId },
  });

  revalidatePath("/contacts");
  return { success: true };
}
