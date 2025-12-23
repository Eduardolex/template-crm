import { getTenantContext, getEntityLabels } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { DealsContent } from "./deals-content";
import { Button } from "@/components/ui/button";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";
import { DealDialog } from "./deal-dialog";
import Link from "next/link";

async function getDealsData(tenantId: string) {
  const [deals, stages, contacts, companies] = await Promise.all([
    prisma.deal.findMany({
      where: { tenantId },
      include: {
        stage: true,
        contact: true,
        company: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stage.findMany({
      where: { pipeline: { tenantId } },
      orderBy: { position: "asc" },
    }),
    prisma.contact.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.company.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
  ]);

  return { deals, stages, contacts, companies };
}

export default async function DealsPage(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { tenantId } = await getTenantContext();
  const labels = await getEntityLabels();
  const { deals, stages, contacts, companies } = await getDealsData(tenantId);
  const view = searchParams.view || "kanban";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{labels.deals.plural}</h1>
          <p className="text-slate-600">Manage your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <Link
              href="/deals?view=kanban"
              className={`px-3 py-2 text-sm ${
                view === "kanban" ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <Link
              href="/deals?view=list"
              className={`px-3 py-2 text-sm ${
                view === "list" ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </Link>
          </div>
          <DealDialog
            stages={stages}
            contacts={contacts}
            companies={companies}
            dealLabel={labels.deals.singular}
            contactLabel={labels.contacts.singular}
            companyLabel={labels.companies.singular}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New {labels.deals.singular}
            </Button>
          </DealDialog>
        </div>
      </div>

      <DealsContent
        deals={deals}
        stages={stages}
        contacts={contacts}
        companies={companies}
        view={view}
        dealLabel={labels.deals.singular}
        dealsLabel={labels.deals.plural}
        contactLabel={labels.contacts.singular}
        companyLabel={labels.companies.singular}
      />
    </div>
  );
}
