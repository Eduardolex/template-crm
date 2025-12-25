"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/db/tenant-context";

const stageSchema = z.object({
  name: z.string().min(1, "Stage name required"),
  position: z.number().min(0),
  isWon: z.boolean(),
  isLost: z.boolean(),
});

export async function createStageAction(
  pipelineId: string,
  data: z.infer<typeof stageSchema>
) {
  await requireAdmin();
  const validated = stageSchema.parse(data);

  const stage = await prisma.stage.create({
    data: {
      ...validated,
      pipelineId,
    },
  });

  revalidatePath("/settings/pipeline");
  return { success: true, stageId: stage.id };
}

export async function updateStageAction(
  id: string,
  data: z.infer<typeof stageSchema>
) {
  await requireAdmin();
  const validated = stageSchema.parse(data);

  await prisma.stage.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/settings/pipeline");
  revalidatePath("/deals");
  return { success: true };
}

export async function deleteStageAction(id: string) {
  await requireAdmin();

  // Check if any deals are in this stage
  const dealsInStage = await prisma.deal.count({
    where: { stageId: id },
  });

  if (dealsInStage > 0) {
    throw new Error(
      `Cannot delete stage with ${dealsInStage} deals. Move deals to another stage first.`
    );
  }

  await prisma.stage.delete({
    where: { id },
  });

  revalidatePath("/settings/pipeline");
  return { success: true };
}
