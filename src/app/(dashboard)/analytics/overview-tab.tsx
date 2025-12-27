"use client";

import { KPICard } from "./components/kpi-card";
import { DollarSign, TrendingUp, Target, Timer, Briefcase } from "lucide-react";
import { PipelineByStageChart } from "./components/pipeline-by-stage-chart";
import { RevenueOverTimeChart } from "./components/revenue-over-time-chart";
import { WinRateTrendChart } from "./components/win-rate-trend-chart";

type Deal = {
  id: string;
  stageId: string;
  valueCents: number;
  createdAt: Date;
  updatedAt: Date;
  stage: {
    id: string;
    name: string;
    isWon: boolean;
    isLost: boolean;
  };
};

type Stage = {
  id: string;
  name: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
};

interface OverviewTabProps {
  deals: Deal[];
  stages: Stage[];
}

export function OverviewTab({ deals, stages }: OverviewTabProps) {
  // Filter active stages and deals (not won or lost)
  const activeStages = stages.filter((s) => !s.isWon && !s.isLost);
  const activeDeals = deals.filter((d) => !d.stage.isWon && !d.stage.isLost);

  // 1. Total Pipeline Value
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.valueCents, 0) / 100;

  // 2. Active Deals Count
  const activeDealCount = activeDeals.length;

  // 3. Average Deal Size
  const avgDealSize = activeDealCount > 0 ? totalPipelineValue / activeDealCount : 0;

  // 4. Win Rate (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentDeals = deals.filter(
    (d) =>
      new Date(d.createdAt) >= ninetyDaysAgo &&
      (d.stage.isWon || d.stage.isLost)
  );
  const wonDeals = recentDeals.filter((d) => d.stage.isWon);
  const winRate = recentDeals.length > 0 ? (wonDeals.length / recentDeals.length) * 100 : 0;

  // 5. Sales Velocity (avg days to close, last 90 days)
  const recentWonDeals = deals.filter(
    (d) => d.stage.isWon && new Date(d.updatedAt) >= ninetyDaysAgo
  );

  const totalDays = recentWonDeals.reduce((sum, d) => {
    const created = new Date(d.createdAt);
    const closed = new Date(d.updatedAt);
    const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  const salesVelocity = recentWonDeals.length > 0 ? Math.round(totalDays / recentWonDeals.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Pipeline Value"
          value={`$${totalPipelineValue.toLocaleString()}`}
          subtitle={`${activeDealCount} active deals`}
          icon={DollarSign}
        />
        <KPICard
          title="Active Deals"
          value={activeDealCount.toString()}
          subtitle="Open opportunities"
          icon={Briefcase}
        />
        <KPICard
          title="Avg Deal Size"
          value={`$${Math.round(avgDealSize).toLocaleString()}`}
          subtitle="Per opportunity"
          icon={TrendingUp}
        />
        <KPICard
          title="Win Rate (90d)"
          value={`${winRate.toFixed(1)}%`}
          subtitle={`${wonDeals.length}/${recentDeals.length} closed won`}
          icon={Target}
        />
        <KPICard
          title="Avg Days to Close"
          value={`${salesVelocity} days`}
          subtitle="Sales velocity"
          icon={Timer}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PipelineByStageChart stages={activeStages} deals={activeDeals} />
        <RevenueOverTimeChart deals={deals} />
      </div>

      <WinRateTrendChart deals={deals} />
    </div>
  );
}
