import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { ActivitiesView } from "./activities-view";

async function getActivitiesData(tenantId: string) {
  const [activities, users, contacts, deals, automationTemplates] = await Promise.all([
    prisma.activity.findMany({
      where: { tenantId },
      include: {
        assignedUser: true,
        contact: true,
        deal: true,
        automationTemplate: true,
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    }),
    prisma.user.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.deal.findMany({
      where: { tenantId },
      select: { id: true, title: true },
    }),
    prisma.automationTemplate.findMany({
      where: { tenantId },
      select: { id: true, name: true, enabled: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { activities, users, contacts, deals, automationTemplates };
}

export default async function TasksPage() {
  const { tenantId } = await getTenantContext();
  const { activities, users, contacts, deals, automationTemplates } = await getActivitiesData(tenantId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="text-slate-600">Manage your tasks, notes, and calls</p>
      </div>
      <ActivitiesView
        activities={activities}
        users={users}
        contacts={contacts}
        deals={deals}
        automationTemplates={automationTemplates}
      />
    </div>
  );
}
