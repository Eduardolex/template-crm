import { getTenantContext, getEntityLabels } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { CompaniesTable } from "./companies-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyDialog } from "./company-dialog";

async function getCompanies(tenantId: string) {
  return prisma.company.findMany({
    where: { tenantId },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function CompaniesPage() {
  const { tenantId } = await getTenantContext();
  const labels = await getEntityLabels();
  const companies = await getCompanies(tenantId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{labels.companies.plural}</h1>
          <p className="text-slate-600">Manage your {labels.companies.plural.toLowerCase()}</p>
        </div>
        <CompanyDialog companyLabel={labels.companies.singular}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {labels.companies.singular}
          </Button>
        </CompanyDialog>
      </div>
      <CompaniesTable companies={companies} companyLabel={labels.companies.singular} />
    </div>
  );
}
