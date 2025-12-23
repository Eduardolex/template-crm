"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sliders, Grid3x3, Zap, Users, Tag, Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsTabs = [
  {
    name: "Team",
    href: "/settings/team",
    icon: Users,
  },
  {
    name: "Branding",
    href: "/settings/branding",
    icon: Palette,
  },
  {
    name: "Entity Labels",
    href: "/settings/entity-labels",
    icon: Tag,
  },
  {
    name: "Custom Fields",
    href: "/settings/custom-fields",
    icon: Grid3x3,
  },
  {
    name: "Pipeline",
    href: "/settings/pipeline",
    icon: Sliders,
  },
  {
    name: "Automation Templates",
    href: "/settings/automation-templates",
    icon: Zap,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = settingsTabs.find((tab) => pathname.startsWith(tab.href));
  const CurrentIcon = currentTab?.icon || Users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-2">
          Manage your CRM configuration and preferences
        </p>
      </div>

      {/* Mobile dropdown */}
      <div className="md:hidden">
        <Select
          value={currentTab?.href}
          onValueChange={(value) => router.push(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center">
                <CurrentIcon className="mr-2 h-5 w-5" />
                {currentTab?.name || "Select a setting"}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {settingsTabs.map((tab) => (
              <SelectItem key={tab.name} value={tab.href}>
                <div className="flex items-center">
                  <tab.icon className="mr-2 h-5 w-5" />
                  {tab.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:block border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {settingsTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                <tab.icon
                  className={cn(
                    "mr-2 h-5 w-5",
                    isActive
                      ? "text-slate-900"
                      : "text-slate-400 group-hover:text-slate-500"
                  )}
                />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
