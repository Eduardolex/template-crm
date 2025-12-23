import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { TemplateList } from "./template-list";

export default async function AutomationTemplatesPage() {
  await requireAdmin();

  const { tenantId } = await requireAdmin();

  const templates = await prisma.automationTemplate.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Automation Templates
        </h1>
        <p className="text-slate-600 mt-2">
          Create reusable templates for task completion follow-ups. When a task
          is completed, the automation will send the message to the associated
          contact.
        </p>
      </div>

      <TemplateList initialTemplates={templates} />
    </div>
  );
}
