"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { exportDealsCSVAction } from "@/lib/actions/analytics-actions";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  createdAt: Date;
  stage: {
    id: string;
    name: string;
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

type User = {
  id: string;
  name: string;
};

interface ReportsTabProps {
  deals: Deal[];
  stages: Stage[];
  users: User[];
  role: string;
}

export function ReportsTab({ deals, stages, users, role }: ReportsTabProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Apply filters to deals
  const filteredDeals = deals.filter((deal) => {
    if (startDate && new Date(deal.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(deal.createdAt) > new Date(endDate)) return false;
    if (selectedOwner !== "all" && deal.owner.id !== selectedOwner) return false;
    if (selectedStage !== "all" && deal.stage.id !== selectedStage) return false;
    return true;
  });

  // Calculate summary stats
  const totalValue = filteredDeals.reduce((sum, d) => sum + d.valueCents, 0) / 100;
  const wonDeals = filteredDeals.filter((d) => d.stage.isWon);
  const lostDeals = filteredDeals.filter((d) => d.stage.isLost);
  const openDeals = filteredDeals.filter((d) => !d.stage.isWon && !d.stage.isLost);

  async function handleExportCSV() {
    setExporting(true);
    try {
      const result = await exportDealsCSVAction({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ownerId: selectedOwner !== "all" ? selectedOwner : undefined,
        stageId: selectedStage !== "all" ? selectedStage : undefined,
      });

      if (result.success && result.csv) {
        // Create blob and download
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger id="owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Won / Lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wonDeals.length} / {lostDeals.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Open Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openDeals.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table with Export */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deals Report</CardTitle>
          <Button onClick={handleExportCSV} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Deal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      No deals match the selected filters
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 text-sm">{deal.title}</td>
                      <td className="px-4 py-3 text-sm">{deal.stage.name}</td>
                      <td className="px-4 py-3 text-sm">{deal.owner.name}</td>
                      <td className="px-4 py-3 text-sm">
                        ${(deal.valueCents / 100).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {deal.stage.isWon ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Won
                          </span>
                        ) : deal.stage.isLost ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Lost
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Open
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredDeals.length > 0 && (
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
