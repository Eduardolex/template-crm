"use server";

import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";

type ExportFilters = {
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  stageId?: string;
};

export async function exportDealsCSVAction(filters: ExportFilters) {
  const { tenantId, userId, role } = await getTenantContext();

  // Build where clause with role-based filtering
  const where: any = {
    tenantId,
    ...(role === "member" ? { ownerUserId: userId } : {}),
  };

  // Apply date filters
  if (filters.startDate) {
    where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
  }

  // Apply owner filter (admin only)
  if (filters.ownerId && role === "admin") {
    where.ownerUserId = filters.ownerId;
  }

  // Apply stage filter
  if (filters.stageId) {
    where.stageId = filters.stageId;
  }

  // Fetch deals with all necessary relations
  const deals = await prisma.deal.findMany({
    where,
    include: {
      stage: true,
      owner: { select: { id: true, name: true } },
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      company: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Generate CSV content
  const headers = [
    "Deal Title",
    "Stage",
    "Value",
    "Owner",
    "Contact",
    "Company",
    "Created Date",
    "Updated Date",
    "Status",
  ];

  const rows = deals.map((deal) => [
    escapeCSV(deal.title),
    escapeCSV(deal.stage.name),
    `$${(deal.valueCents / 100).toFixed(2)}`,
    escapeCSV(deal.owner.name),
    deal.contact
      ? escapeCSV(`${deal.contact.firstName} ${deal.contact.lastName}`)
      : "",
    deal.company ? escapeCSV(deal.company.name) : "",
    new Date(deal.createdAt).toLocaleDateString(),
    new Date(deal.updatedAt).toLocaleDateString(),
    deal.stage.isWon ? "Won" : deal.stage.isLost ? "Lost" : "Open",
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  return {
    success: true,
    csv: csvContent,
    filename: `deals-export-${new Date().toISOString().split("T")[0]}.csv`,
  };
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
