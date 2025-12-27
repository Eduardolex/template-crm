"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Deal = {
  createdAt: Date;
  stage: {
    isWon: boolean;
    isLost: boolean;
  };
};

interface WinRateTrendChartProps {
  deals: Deal[];
}

export function WinRateTrendChart({ deals }: WinRateTrendChartProps) {
  // Filter closed deals only (won or lost)
  const closedDeals = deals.filter((d) => d.stage.isWon || d.stage.isLost);

  // Group by month and calculate win rate
  const monthlyData: Record<string, { total: number; won: number }> = {};
  closedDeals.forEach((deal) => {
    const month = new Date(deal.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, won: 0 };
    }
    monthlyData[month].total++;
    if (deal.stage.isWon) {
      monthlyData[month].won++;
    }
  });

  const data = Object.entries(monthlyData)
    .map(([month, stats]) => ({
      month,
      winRate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0,
      deals: stats.total,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Win Rate Trend</CardTitle>
        <CardDescription>Monthly win rate percentage</CardDescription>
      </CardHeader>
      <CardContent className="overflow-visible">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                zIndex: 1000,
              }}
              wrapperStyle={{ zIndex: 1000 }}
              formatter={(value: any, name, props) => [
                `${value.toFixed(1)}%`,
                `Win Rate (${props.payload.deals} deals)`,
              ]}
            />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
