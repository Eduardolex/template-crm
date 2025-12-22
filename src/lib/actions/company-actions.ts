"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/db/tenant-context";

const companySchema = z.object({
  name: z.string().min(1, "Company name required"),
  website: z.string().optional(),
  phone: z.string().optional(),
});

export async function createCompanyAction(data: z.infer<typeof companySchema>) {
  const { tenantId, userId } = await getTenantContext();
  const validated = companySchema.parse(data);

  await prisma.company.create({
    data: {
      ...validated,
      website: validated.website || null,
      phone: validated.phone || null,
      tenantId,
      ownerUserId: userId,
    },
  });

  revalidatePath("/companies");
  return { success: true };
}

export async function updateCompanyAction(id: string, data: z.infer<typeof companySchema>) {
  const { tenantId } = await getTenantContext();
  const validated = companySchema.parse(data);

  await prisma.company.update({
    where: { id, tenantId },
    data: {
      ...validated,
      website: validated.website || null,
      phone: validated.phone || null,
    },
  });

  revalidatePath("/companies");
  return { success: true };
}

export async function deleteCompanyAction(id: string) {
  const { tenantId } = await getTenantContext();

  await prisma.company.delete({
    where: { id, tenantId },
  });

  revalidatePath("/companies");
  return { success: true };
}
