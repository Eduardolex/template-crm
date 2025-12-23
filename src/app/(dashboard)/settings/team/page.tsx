import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { TeamList } from "./team-list";

export default async function TeamPage() {
  await requireAdmin();

  const { tenantId } = await requireAdmin();

  const users = await prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          contacts: true,
          companies: true,
          deals: true,
          assignedTasks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-slate-600 mt-2">
          Manage your team members and their access levels.
        </p>
      </div>

      <TeamList initialUsers={users} />
    </div>
  );
}
