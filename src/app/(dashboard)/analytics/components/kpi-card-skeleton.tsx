import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-2" />
      </CardContent>
    </Card>
  );
}
