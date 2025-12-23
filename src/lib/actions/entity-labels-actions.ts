"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/db/tenant-context";

const entityLabelsSchema = z.object({
  dealsLabel: z.string().min(1, "Deals label is required").max(50),
  dealsSingularLabel: z.string().min(1, "Deal singular label is required").max(50),
  contactsLabel: z.string().min(1, "Contacts label is required").max(50),
  contactsSingularLabel: z.string().min(1, "Contact singular label is required").max(50),
  companiesLabel: z.string().min(1, "Companies label is required").max(50),
  companiesSingularLabel: z.string().min(1, "Company singular label is required").max(50),
});

export type EntityLabelsInput = z.infer<typeof entityLabelsSchema>;

/**
 * Update entity labels for the current tenant (Admin only)
 */
export async function updateEntityLabelsAction(data: EntityLabelsInput) {
  try {
    const { tenantId } = await requireAdmin();

    const validated = entityLabelsSchema.parse(data);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        dealsLabel: validated.dealsLabel,
        dealsSingularLabel: validated.dealsSingularLabel,
        contactsLabel: validated.contactsLabel,
        contactsSingularLabel: validated.contactsSingularLabel,
        companiesLabel: validated.companiesLabel,
        companiesSingularLabel: validated.companiesSingularLabel,
      },
    });

    // Revalidate all pages that use labels
    revalidatePath("/", "layout"); // Revalidates entire app including sidebar
    revalidatePath("/deals");
    revalidatePath("/contacts");
    revalidatePath("/companies");
    revalidatePath("/dashboard");
    revalidatePath("/settings/custom-fields");
    revalidatePath("/settings/entity-labels");

    return { success: true };
  } catch (error) {
    console.error("Error updating entity labels:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update entity labels" };
  }
}
