"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext, requireAdmin } from "@/lib/db/tenant-context";

// Validation schemas
const automationTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  messageTemplate: z.string().min(1, "Message template is required"),
  sendTo: z.enum(["contact", "custom"]),
  customEmail: z.string().email().optional().nullable(),
  enabled: z.boolean().default(true),
});

export type AutomationTemplateInput = z.infer<typeof automationTemplateSchema>;

/**
 * Create a new automation template (Admin only)
 */
export async function createAutomationTemplateAction(
  data: AutomationTemplateInput
) {
  try {
    const { tenantId } = await requireAdmin();

    const validated = automationTemplateSchema.parse(data);

    // Validate customEmail if sendTo is "custom"
    if (validated.sendTo === "custom" && !validated.customEmail) {
      return {
        success: false,
        error: "Custom email is required when send to is set to custom",
      };
    }

    const template = await prisma.automationTemplate.create({
      data: {
        ...validated,
        tenantId,
      },
    });

    revalidatePath("/settings/automation-templates");
    revalidatePath("/tasks");

    return { success: true, template };
  } catch (error) {
    console.error("Error creating automation template:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create automation template" };
  }
}

/**
 * Update an automation template (Admin only)
 */
export async function updateAutomationTemplateAction(
  id: string,
  data: AutomationTemplateInput
) {
  try {
    const { tenantId } = await requireAdmin();

    const validated = automationTemplateSchema.parse(data);

    // Validate customEmail if sendTo is "custom"
    if (validated.sendTo === "custom" && !validated.customEmail) {
      return {
        success: false,
        error: "Custom email is required when send to is set to custom",
      };
    }

    const template = await prisma.automationTemplate.update({
      where: {
        id,
        tenantId,
      },
      data: validated,
    });

    revalidatePath("/settings/automation-templates");
    revalidatePath("/tasks");

    return { success: true, template };
  } catch (error) {
    console.error("Error updating automation template:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update automation template" };
  }
}

/**
 * Delete an automation template (Admin only)
 */
export async function deleteAutomationTemplateAction(id: string) {
  try {
    const { tenantId } = await requireAdmin();

    await prisma.automationTemplate.delete({
      where: {
        id,
        tenantId,
      },
    });

    revalidatePath("/settings/automation-templates");
    revalidatePath("/tasks");

    return { success: true };
  } catch (error) {
    console.error("Error deleting automation template:", error);
    return { success: false, error: "Failed to delete automation template" };
  }
}

/**
 * Get all automation templates for the current tenant
 */
export async function getAutomationTemplatesAction() {
  try {
    const { tenantId } = await getTenantContext();

    const templates = await prisma.automationTemplate.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, templates };
  } catch (error) {
    console.error("Error fetching automation templates:", error);
    return { success: false, error: "Failed to fetch automation templates", templates: [] };
  }
}

/**
 * Toggle template enabled/disabled status (Admin only)
 */
export async function toggleAutomationTemplateAction(id: string) {
  try {
    const { tenantId } = await requireAdmin();

    const template = await prisma.automationTemplate.findUnique({
      where: { id, tenantId },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    const updated = await prisma.automationTemplate.update({
      where: { id, tenantId },
      data: {
        enabled: !template.enabled,
      },
    });

    revalidatePath("/settings/automation-templates");
    revalidatePath("/tasks");

    return { success: true, template: updated };
  } catch (error) {
    console.error("Error toggling automation template:", error);
    return { success: false, error: "Failed to toggle automation template" };
  }
}
