"use client";

import { KPICard } from "./components/kpi-card";
import { Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Deal = {
  id: string;
  valueCents: number;
  createdAt: Date;
  updatedAt: Date;
  ownerUserId: string;
  stage: {
    isWon: boolean;
    isLost: boolean;
  };
  owner: {
    id: string;
    name: string;
  };
};

type Stage = {
  id: string;
  name: string;
};

interface PerformanceTabProps {
  deals: Deal[];
  stages: Stage[];
  customFields: any[];
}

export function PerformanceTab({ deals, stages, customFields }: PerformanceTabProps) {
  // Calculate average cycle time for won deals
  const wonDeals = deals.filter((d) => d.stage.isWon);
  const avgCycleTime = wonDeals.length > 0
    ? wonDeals.reduce((sum, d) => {
        const days = (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / wonDeals.length
    : 0;

  // Group deals by owner
  const dealsByOwner: Record<string, { name: string; won: number; total: number; value: number }> = {};
  deals.forEach((deal) => {
    if (!dealsByOwner[deal.ownerUserId]) {
      dealsByOwner[deal.ownerUserId] = { name: deal.owner.name, won: 0, total: 0, value: 0 };
    }
    if (deal.stage.isWon) {
      dealsByOwner[deal.ownerUserId].won++;
      dealsByOwner[deal.ownerUserId].value += deal.valueCents / 100;
    }
    if (deal.stage.isWon || deal.stage.isLost) {
      dealsByOwner[deal.ownerUserId].total++;
    }
  });

  const leaderboard = Object.values(dealsByOwner)
    .filter((owner) => owner.won > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <KPICard
        title="Avg Cycle Time"
        value={`${Math.round(avgCycleTime)} days`}
        subtitle="For closed-won deals"
        icon={Timer}
      />

      <Card>
        <CardHeader>
          <CardTitle>Sales Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Deals Won</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaderboard.map((owner, index) => {
                  const winRate = owner.total > 0 ? (owner.won / owner.total) * 100 : 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 text-sm font-medium">{owner.name}</td>
                      <td className="px-4 py-3 text-sm">{owner.won}</td>
                      <td className="px-4 py-3 text-sm">${owner.value.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{winRate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
