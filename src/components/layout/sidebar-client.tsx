"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  Settings,
} from "lucide-react";
import type { EntityLabels } from "@/lib/db/tenant-context";

const getNavigation = (labels: EntityLabels) => [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: labels.contacts.plural, href: "/contacts", icon: Users },
  { name: labels.companies.plural, href: "/companies", icon: Building2 },
  { name: labels.deals.plural, href: "/deals", icon: Briefcase },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export function SidebarClient({
  labels,
  branding,
}: {
  labels: EntityLabels;
  branding: { logoUrl: string | null; name: string };
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";
  const navigation = getNavigation(labels);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.name}
            className="max-h-10 max-w-full object-contain"
            onError={(e) => {
              // Fallback to text if image fails to load
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<h1 class="text-xl font-bold">CRM</h1>`;
              }
            }}
          />
        ) : (
          <h1 className="text-xl font-bold">CRM</h1>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
