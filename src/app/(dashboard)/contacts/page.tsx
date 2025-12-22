import { getTenantContext } from "@/lib/db/tenant-context";
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
  const contacts = await getContacts(tenantId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-slate-600">Manage your contacts</p>
        </div>
        <ContactDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </ContactDialog>
      </div>
      <ContactsTable contacts={contacts} />
    </div>
  );
}
