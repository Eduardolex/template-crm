import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EntityLabels = {
  deals: { plural: string; singular: string };
  contacts: { plural: string; singular: string };
  companies: { plural: string; singular: string };
};

// Default labels to use as fallback when database fetch fails
const DEFAULT_LABELS: EntityLabels = {
  deals: { plural: "Deals", singular: "Deal" },
  contacts: { plural: "Contacts", singular: "Contact" },
  companies: { plural: "Companies", singular: "Company" },
};

export async function getTenantContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.tenantId) {
    throw new Error("Unauthorized: No valid session");
  }

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
    user: session.user,
  };
}

export async function requireAdmin() {
  const context = await getTenantContext();

  if (context.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return context;
}

export async function withTenant<T>(
  callback: (context: { tenantId: string; userId: string; role: string }) => Promise<T>
): Promise<T> {
  const context = await getTenantContext();
  return callback(context);
}

/**
 * Get entity labels for the current tenant
 * Returns both plural and singular forms
 * Falls back to default labels if database fetch fails
 */
export async function getEntityLabels(): Promise<EntityLabels> {
  try {
    const { tenantId } = await getTenantContext();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        dealsLabel: true,
        dealsSingularLabel: true,
        contactsLabel: true,
        contactsSingularLabel: true,
        companiesLabel: true,
        companiesSingularLabel: true,
      },
    });

    if (!tenant) {
      console.error("[getEntityLabels] Tenant not found:", tenantId);
      return DEFAULT_LABELS;
    }

    // Return labels with fallback to defaults for any null values
    return {
      deals: {
        plural: tenant.dealsLabel || DEFAULT_LABELS.deals.plural,
        singular: tenant.dealsSingularLabel || DEFAULT_LABELS.deals.singular,
      },
      contacts: {
        plural: tenant.contactsLabel || DEFAULT_LABELS.contacts.plural,
        singular: tenant.contactsSingularLabel || DEFAULT_LABELS.contacts.singular,
      },
      companies: {
        plural: tenant.companiesLabel || DEFAULT_LABELS.companies.plural,
        singular: tenant.companiesSingularLabel || DEFAULT_LABELS.companies.singular,
      },
    };
  } catch (error) {
    console.error("[getEntityLabels] Error fetching labels:", error);
    return DEFAULT_LABELS;
  }
}

/**
 * Get tenant branding info (logo URL, name)
 * Used by sidebar for display
 */
export async function getTenantBranding(): Promise<{
  logoUrl: string | null;
  name: string;
}> {
  const { tenantId } = await getTenantContext();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      logoUrl: true,
      name: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return {
    logoUrl: tenant.logoUrl,
    name: tenant.name,
  };
}
