"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/db/tenant-context";

const fieldSchema = z.object({
  objectType: z.enum(["contact", "company", "deal"]),
  key: z.string().min(1).regex(/^[a-z_]+$/, "Use lowercase letters and underscores only"),
  label: z.string().min(1),
  fieldType: z.enum(["text", "number", "date", "select"]),
  required: z.boolean(),
  optionsJsonb: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

export async function createCustomFieldAction(data: z.infer<typeof fieldSchema>) {
  const { tenantId } = await requireAdmin();
  const validated = fieldSchema.parse(data);

  const maxPosition = await prisma.customField.findFirst({
    where: { tenantId, objectType: validated.objectType },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.customField.create({
    data: {
      ...validated,
      optionsJsonb: validated.optionsJsonb || null,
      tenantId,
      position: (maxPosition?.position ?? -1) + 1,
    },
  });

  revalidatePath("/settings/custom-fields");
  return { success: true };
}

export async function deleteCustomFieldAction(id: string) {
  const { tenantId } = await requireAdmin();

  await prisma.customField.delete({
    where: { id, tenantId },
  });

  revalidatePath("/settings/custom-fields");
  return { success: true };
}

export async function saveCustomFieldValuesAction(
  objectType: string,
  objectId: string,
  values: Record<string, any>
) {
  const { tenantId } = await requireAdmin();

  for (const [fieldId, value] of Object.entries(values)) {
    if (value === "" || value === null || value === undefined) continue;

    await prisma.customFieldValue.upsert({
      where: {
        tenantId_objectType_objectId_customFieldId: {
          tenantId,
          objectType,
          objectId,
          customFieldId: fieldId,
        },
      },
      update: { valueJsonb: value },
      create: {
        tenantId,
        objectType,
        objectId,
        customFieldId: fieldId,
        valueJsonb: value,
      },
    });
  }

  return { success: true };
}
