"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileSidebar } from "./mobile-sidebar-provider";

export function MobileMenuButton() {
  const { toggle } = useMobileSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggle}
      aria-label="Toggle menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}
