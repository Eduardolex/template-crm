"use client";

import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Stage = { id: string; name: string; position: number };
type Deal = { stageId: string; valueCents: number };

interface PipelineByStageChartProps {
  stages: Stage[];
  deals: Deal[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly {
    payload: any;
    value?: number;
  }[];
  label?: string | number;
  coordinate?: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function PortalTooltip({
  active,
  payload,
  label,
  coordinate,
  containerRef,
}: CustomTooltipProps) {
  if (!active || !payload?.length || !coordinate) return null;

  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect || typeof window === "undefined") return null;

  const count = (payload[0]?.payload as any)?.count ?? 0;
  const value = Number(payload[0]?.value ?? 0);

  // Position relative to the chart container, but render as fixed to escape SVG stacking/clipping.
  const rawLeft = rect.left + coordinate.x + 12;
  const rawTop = rect.top + coordinate.y - 48;

  const left = clamp(rawLeft, 8, window.innerWidth - 260); // keep on-screen
  const top = clamp(rawTop, 8, window.innerHeight - 80);

  return createPortal(
    <div
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 99999999,
        pointerEvents: "none",
      }}
      className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg"
    >
      <div className="font-medium">
        {label} ({count} deals)
      </div>
      <div className="text-muted-foreground">
        Total Value: <span className="font-medium text-foreground">${value.toLocaleString()}</span>
      </div>
    </div>,
    document.body
  );
}

export function PipelineByStageChart({ stages, deals }: PipelineByStageChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stageId === stage.id);
      const totalValue = stageDeals.reduce((sum, d) => sum + d.valueCents, 0) / 100;
      return { name: stage.name, value: totalValue, count: stageDeals.length };
    });
  }, [stages, deals]);

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
        <CardDescription>Total value of deals in each stage</CardDescription>
      </CardHeader>

      <CardContent className="overflow-visible">
        <div ref={containerRef} className="relative overflow-visible">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 28, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--foreground))" }} />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                // Render tooltip via portal so it can’t be covered by bars/SVG
                content={(props) => <PortalTooltip {...props} containerRef={containerRef} />}
              />

              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
