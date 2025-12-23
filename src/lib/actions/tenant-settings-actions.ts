"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/db/tenant-context";
import { isValidPresetId } from "@/lib/color-presets";

// Zod schema for tenant settings validation
const tenantSettingsSchema = z.object({
  logoUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  colorScheme: z
    .string()
    .refine(isValidPresetId, {
      message: "Invalid color scheme selected",
    })
    .optional(),
});

export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;

/**
 * Update tenant settings (Admin only)
 * Handles: logo URL, color scheme
 */
export async function updateTenantSettingsAction(data: TenantSettingsInput) {
  try {
    // 1. Require admin access (throws if not admin)
    const { tenantId } = await requireAdmin();

    // 2. Validate input with Zod
    const validated = tenantSettingsSchema.parse(data);

    // 3. Prepare update data
    const updateData: any = {};

    // Handle logo URL
    if ("logoUrl" in validated) {
      updateData.logoUrl = validated.logoUrl === "" ? null : validated.logoUrl;
    }

    // Handle color scheme
    if (validated.colorScheme) {
      updateData.colorScheme = validated.colorScheme;
    }

    // 4. Update tenant record
    await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    // 5. Invalidate cache (entire layout since sidebar uses this)
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error updating tenant settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update tenant settings" };
  }
}
