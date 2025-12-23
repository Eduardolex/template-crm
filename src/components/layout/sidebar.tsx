import { getEntityLabels, getTenantBranding } from "@/lib/db/tenant-context";
import { SidebarClient } from "./sidebar-client";

export async function Sidebar() {
  // Parallel data fetching for performance
  const [labels, branding] = await Promise.all([
    getEntityLabels(),
    getTenantBranding(),
  ]);

  return <SidebarClient labels={labels} branding={branding} />;
}
