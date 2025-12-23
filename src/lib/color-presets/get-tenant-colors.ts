"use server";

import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { generateColorCSS, DEFAULT_PRESET_ID } from "./index";

/**
 * Get CSS string for current tenant's color scheme
 * Used by dashboard layout to inject into <style> tag
 */
export async function getTenantColorCSS(): Promise<string> {
  try {
    const { tenantId } = await getTenantContext();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { colorScheme: true },
    });

    const presetId = tenant?.colorScheme || DEFAULT_PRESET_ID;
    return generateColorCSS(presetId);
  } catch (error) {
    console.error("Error fetching tenant colors:", error);
    return generateColorCSS(DEFAULT_PRESET_ID);
  }
}

/**
 * Get tenant's current color scheme ID
 */
export async function getTenantColorScheme(): Promise<string> {
  try {
    const { tenantId } = await getTenantContext();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { colorScheme: true },
    });

    return tenant?.colorScheme || DEFAULT_PRESET_ID;
  } catch (error) {
    console.error("Error fetching tenant color scheme:", error);
    return DEFAULT_PRESET_ID;
  }
}
