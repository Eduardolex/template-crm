import { requireAdmin, getEntityLabels } from "@/lib/db/tenant-context";
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
  const labels = await getEntityLabels();
  const fields = await getCustomFields(tenantId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Custom Fields</h1>
        <p className="text-slate-600">
          Add custom fields to {labels.contacts.plural.toLowerCase()}, {labels.companies.plural.toLowerCase()}, and {labels.deals.plural.toLowerCase()}
        </p>
      </div>

      <Tabs defaultValue="deal">
        <TabsList>
          <TabsTrigger value="deal">{labels.deals.plural}</TabsTrigger>
          <TabsTrigger value="contact">{labels.contacts.plural}</TabsTrigger>
          <TabsTrigger value="company">{labels.companies.plural}</TabsTrigger>
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
