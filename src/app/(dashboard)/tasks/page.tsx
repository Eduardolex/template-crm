import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { TasksTable } from "./tasks-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "./task-dialog";

async function getTasksData(tenantId: string) {
  const [tasks, users, contacts, deals, automationTemplates] = await Promise.all([
    prisma.activity.findMany({
      where: {
        tenantId,
        type: "task",
      },
      include: {
        assignedUser: true,
        contact: true,
        deal: true,
        automationTemplate: true,
      },
      orderBy: [
        { status: "asc" },
        { dueAt: "asc" },
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

  return { tasks, users, contacts, deals, automationTemplates };
}

export default async function TasksPage() {
  const { tenantId } = await getTenantContext();
  const { tasks, users, contacts, deals, automationTemplates } = await getTasksData(tenantId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-slate-600">Manage your tasks and to-dos</p>
        </div>
        <TaskDialog
          users={users}
          contacts={contacts}
          deals={deals}
          automationTemplates={automationTemplates}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </TaskDialog>
      </div>
      <TasksTable
        tasks={tasks}
        users={users}
        contacts={contacts}
        deals={deals}
        automationTemplates={automationTemplates}
      />
    </div>
  );
}
