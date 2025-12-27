"use client";

import { KPICard } from "./components/kpi-card";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stageId: string;
  stage: {
    id: string;
    name: string;
    probabilityPercent: number;
    isWon: boolean;
    isLost: boolean;
  };
};

type Stage = {
  id: string;
  name: string;
  probabilityPercent: number;
  isWon: boolean;
  isLost: boolean;
};

interface ForecastTabProps {
  deals: Deal[];
  stages: Stage[];
  customFields: any[];
}

export function ForecastTab({ deals, stages, customFields }: ForecastTabProps) {
  // Filter active deals (not won or lost)
  const activeDeals = deals.filter((d) => !d.stage.isWon && !d.stage.isLost);

  // Calculate weighted pipeline
  const weightedValue = activeDeals.reduce((sum, deal) => {
    const stage = stages.find((s) => s.id === deal.stageId);
    const probability = stage?.probabilityPercent ?? 50;
    return sum + (deal.valueCents * probability) / 100;
  }, 0) / 100; // Convert to dollars

  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.valueCents, 0) / 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <KPICard
          title="Weighted Pipeline"
          value={`$${weightedValue.toLocaleString()}`}
          subtitle="Based on stage probability"
          icon={TrendingUp}
        />
        <KPICard
          title="Total Pipeline"
          value={`$${totalPipelineValue.toLocaleString()}`}
          subtitle={`${activeDeals.length} active deals`}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Deal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Probability</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Weighted Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeDeals.map((deal) => {
                  const weightedDealValue = (deal.valueCents * deal.stage.probabilityPercent) / 10000;
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 text-sm">{deal.title}</td>
                      <td className="px-4 py-3 text-sm">{deal.stage.name}</td>
                      <td className="px-4 py-3 text-sm">${(deal.valueCents / 100).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{deal.stage.probabilityPercent}%</td>
                      <td className="px-4 py-3 text-sm font-medium">${weightedDealValue.toLocaleString()}</td>
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
