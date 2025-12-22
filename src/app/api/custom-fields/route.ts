import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { tenantId } = await getTenantContext();
  const objectType = request.nextUrl.searchParams.get("objectType");

  if (!objectType) {
    return NextResponse.json({ error: "objectType required" }, { status: 400 });
  }

  const fields = await prisma.customField.findMany({
    where: { tenantId, objectType },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(fields);
}
