"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { ForecastTab } from "./forecast-tab";
import { PerformanceTab } from "./performance-tab";
import { ReportsTab } from "./reports-tab";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  createdAt: Date;
  updatedAt: Date;
  stageId: string;
  ownerUserId: string;
  contactId: string | null;
  companyId: string | null;
  stage: {
    id: string;
    name: string;
    position: number;
    probabilityPercent: number;
    isWon: boolean;
    isLost: boolean;
  };
  owner: { id: string; name: string };
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
};

type Stage = {
  id: string;
  name: string;
  position: number;
  probabilityPercent: number;
  isWon: boolean;
  isLost: boolean;
};

type User = { id: string; name: string };
type CustomField = any;

interface AnalyticsViewProps {
  deals: Deal[];
  stages: Stage[];
  users: User[];
  customFields: CustomField[];
  role: string;
}

export function AnalyticsView({
  deals,
  stages,
  users,
  customFields,
  role,
}: AnalyticsViewProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab deals={deals} stages={stages} />
      </TabsContent>

      <TabsContent value="forecast">
        <ForecastTab deals={deals} stages={stages} customFields={customFields} />
      </TabsContent>

      <TabsContent value="performance">
        <PerformanceTab deals={deals} stages={stages} customFields={customFields} />
      </TabsContent>

      <TabsContent value="reports">
        <ReportsTab deals={deals} stages={stages} users={users} role={role} />
      </TabsContent>
    </Tabs>
  );
}
