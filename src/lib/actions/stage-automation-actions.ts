"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/db/tenant-context";

const stageAutomationSchema = z.object({
  automationTemplateIds: z.array(z.string()),
});

export async function updateStageAutomationsAction(
  stageId: string,
  data: z.infer<typeof stageAutomationSchema>
) {
  const { tenantId } = await requireAdmin();
  const validated = stageAutomationSchema.parse(data);

  // Verify stage belongs to tenant
  const stage = await prisma.stage.findFirst({
    where: {
      id: stageId,
      pipeline: { tenantId },
    },
  });

  if (!stage) {
    throw new Error("Stage not found");
  }

  // Verify all templates belong to tenant
  if (validated.automationTemplateIds.length > 0) {
    const templates = await prisma.automationTemplate.findMany({
      where: {
        id: { in: validated.automationTemplateIds },
        tenantId,
      },
    });

    if (templates.length !== validated.automationTemplateIds.length) {
      throw new Error("Invalid automation template IDs");
    }
  }

  // Replace existing automations
  await prisma.stageAutomation.deleteMany({
    where: { stageId },
  });

  // Create new automations with positions
  if (validated.automationTemplateIds.length > 0) {
    await prisma.stageAutomation.createMany({
      data: validated.automationTemplateIds.map((templateId, index) => ({
        stageId,
        automationTemplateId: templateId,
        position: index,
      })),
    });
  }

  revalidatePath("/settings/pipeline");
  revalidatePath("/deals");
  return { success: true };
}
