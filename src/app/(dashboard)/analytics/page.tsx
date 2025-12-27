import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { AnalyticsView } from "./analytics-view";

async function getAnalyticsData(tenantId: string, userId: string, role: string) {
  const dealWhere = {
    tenantId,
    ...(role === "member" ? { ownerUserId: userId } : {}),
  };

  const [deals, stages, users, customFields] = await Promise.all([
    prisma.deal.findMany({
      where: dealWhere,
      include: {
        stage: true,
        owner: { select: { id: true, name: true } },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.stage.findMany({
      where: { pipeline: { tenantId } },
      orderBy: { position: "asc" },
    }),

    role === "admin"
      ? prisma.user.findMany({
          where: { tenantId },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),

    prisma.customField.findMany({
      where: { tenantId, objectType: "deal" },
      include: {
        values: {
          where: { objectType: "deal" },
        },
      },
    }),
  ]);

  return { deals, stages, users, customFields };
}

export default async function AnalyticsPage() {
  const { tenantId, userId, role } = await getTenantContext();
  const { deals, stages, users, customFields } = await getAnalyticsData(
    tenantId,
    userId,
    role
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Insights into your sales performance
        </p>
      </div>

      <AnalyticsView
        deals={deals}
        stages={stages}
        users={users}
        customFields={customFields}
        role={role}
      />
    </div>
  );
}
