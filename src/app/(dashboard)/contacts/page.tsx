import { getTenantContext, getEntityLabels } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { ContactsTable } from "./contacts-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactDialog } from "./contact-dialog";

async function getContacts(tenantId: string) {
  return prisma.contact.findMany({
    where: { tenantId },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ContactsPage() {
  const { tenantId } = await getTenantContext();
  const labels = await getEntityLabels();
  const contacts = await getContacts(tenantId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{labels.contacts.plural}</h1>
          <p className="text-slate-600">Manage your {labels.contacts.plural.toLowerCase()}</p>
        </div>
        <ContactDialog contactLabel={labels.contacts.singular}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {labels.contacts.singular}
          </Button>
        </ContactDialog>
      </div>
      <ContactsTable contacts={contacts} contactLabel={labels.contacts.singular} />
    </div>
  );
}
