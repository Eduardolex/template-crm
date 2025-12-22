import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, TrendingUp } from "lucide-react";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";

async function getDashboardData(tenantId: string) {
  const [contactCount, companyCount, dealCount, deals, activities] = await Promise.all([
    prisma.contact.count({ where: { tenantId } }),
    prisma.company.count({ where: { tenantId } }),
    prisma.deal.count({ where: { tenantId } }),
    prisma.deal.findMany({
      where: { tenantId },
      include: { stage: true },
    }),
    prisma.activity.findMany({
      where: { tenantId },
      include: {
        deal: { select: { id: true, title: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        assignedUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalValue = deals.reduce((sum, deal) => sum + deal.valueCents, 0);
  const wonDeals = deals.filter((d) => d.stage.isWon);
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.valueCents, 0);

  return {
    contactCount,
    companyCount,
    dealCount,
    totalValue: totalValue / 100, // Convert cents to dollars
    wonValue: wonValue / 100,
    activities,
  };
}

export default async function DashboardPage() {
  const { tenantId } = await getTenantContext();
  const data = await getDashboardData(tenantId);

  const stats = [
    {
      name: "Total Contacts",
      value: data.contactCount.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Total Companies",
      value: data.companyCount.toLocaleString(),
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Active Deals",
      value: data.dealCount.toLocaleString(),
      icon: Briefcase,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Total Deal Value",
      value: `$${data.totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Overview of your CRM metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.name}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600">
              Get started by adding your first contact or creating a new deal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={data.activities} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {data.dealCount} active deals worth ${data.totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
