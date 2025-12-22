import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldList } from "./field-list";

async function getCustomFields(tenantId: string) {
  const fields = await prisma.customField.findMany({
    where: { tenantId },
    orderBy: [{ objectType: "asc" }, { position: "asc" }],
  });

  return {
    contact: fields.filter((f) => f.objectType === "contact"),
    company: fields.filter((f) => f.objectType === "company"),
    deal: fields.filter((f) => f.objectType === "deal"),
  };
}

export default async function CustomFieldsPage() {
  const { tenantId } = await requireAdmin();
  const fields = await getCustomFields(tenantId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Custom Fields</h1>
        <p className="text-slate-600">Add custom fields to contacts, companies, and deals</p>
      </div>

      <Tabs defaultValue="deal">
        <TabsList>
          <TabsTrigger value="deal">Deals</TabsTrigger>
          <TabsTrigger value="contact">Contacts</TabsTrigger>
          <TabsTrigger value="company">Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="deal" className="mt-4">
          <FieldList fields={fields.deal} objectType="deal" />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <FieldList fields={fields.contact} objectType="contact" />
        </TabsContent>
        <TabsContent value="company" className="mt-4">
          <FieldList fields={fields.company} objectType="company" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
