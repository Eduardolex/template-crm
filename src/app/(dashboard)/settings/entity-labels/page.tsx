import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { LabelsForm } from "./labels-form";

export default async function EntityLabelsPage() {
  const { tenantId } = await requireAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      dealsLabel: true,
      dealsSingularLabel: true,
      contactsLabel: true,
      contactsSingularLabel: true,
      companiesLabel: true,
      companiesSingularLabel: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entity Labels</h1>
        <p className="text-slate-600 mt-2">
          Customize how entities are labeled throughout your CRM. Changes apply
          to navigation, page headers, and all user-facing text.
        </p>
      </div>

      <div className="max-w-2xl">
        <LabelsForm
          dealsLabel={tenant.dealsLabel}
          dealsSingularLabel={tenant.dealsSingularLabel}
          contactsLabel={tenant.contactsLabel}
          contactsSingularLabel={tenant.contactsSingularLabel}
          companiesLabel={tenant.companiesLabel}
          companiesSingularLabel={tenant.companiesSingularLabel}
        />
      </div>
    </div>
  );
}
