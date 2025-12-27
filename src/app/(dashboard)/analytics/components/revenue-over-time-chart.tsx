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
  valueCents: number;
  stage: {
    isWon: boolean;
  };
};

interface RevenueOverTimeChartProps {
  deals: Deal[];
}

export function RevenueOverTimeChart({ deals }: RevenueOverTimeChartProps) {
  // Filter won deals only
  const wonDeals = deals.filter((d) => d.stage.isWon);

  // Group by month
  const monthlyData: Record<string, number> = {};
  wonDeals.forEach((deal) => {
    const month = new Date(deal.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    monthlyData[month] = (monthlyData[month] || 0) + deal.valueCents / 100;
  });

  const data = Object.entries(monthlyData)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>Closed-won deals by month</CardDescription>
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                zIndex: 1000,
              }}
              wrapperStyle={{ zIndex: 1000 }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="value"
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
