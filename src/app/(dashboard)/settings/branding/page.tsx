import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { BrandingForm } from "./branding-form";
import { ColorSchemeSelector } from "./color-scheme-selector";

export default async function BrandingPage() {
  const { tenantId } = await requireAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      logoUrl: true,
      name: true,
      colorScheme: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branding</h1>
        <p className="text-slate-600 mt-2">
          Customize your CRM&apos;s appearance with your company logo and colors.
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Logo Section */}
        <BrandingForm
          logoUrl={tenant.logoUrl ?? ""}
          tenantName={tenant.name}
        />

        {/* Color Scheme Section */}
        <ColorSchemeSelector
          currentScheme={tenant.colorScheme || "professional-blue"}
        />
      </div>
    </div>
  );
}
