/**
 * Backfill script to ensure all tenants have default labels
 * Run this if you're seeing issues with missing "New Deal" buttons or other UI elements
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-tenant-labels.ts
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🔍 Checking for tenants with missing labels...");

  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      dealsLabel: true,
      dealsSingularLabel: true,
      contactsLabel: true,
      contactsSingularLabel: true,
      companiesLabel: true,
      companiesSingularLabel: true,
    },
  });

  console.log(`Found ${tenants.length} tenant(s)`);

  let updatedCount = 0;

  for (const tenant of tenants) {
    const needsUpdate =
      !tenant.dealsLabel ||
      !tenant.dealsSingularLabel ||
      !tenant.contactsLabel ||
      !tenant.contactsSingularLabel ||
      !tenant.companiesLabel ||
      !tenant.companiesSingularLabel;

    if (needsUpdate) {
      console.log(`\n📝 Updating tenant: ${tenant.name} (${tenant.id})`);
      console.log("   Current labels:", {
        deals: `${tenant.dealsLabel} / ${tenant.dealsSingularLabel}`,
        contacts: `${tenant.contactsLabel} / ${tenant.contactsSingularLabel}`,
        companies: `${tenant.companiesLabel} / ${tenant.companiesSingularLabel}`,
      });

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          dealsLabel: tenant.dealsLabel || "Deals",
          dealsSingularLabel: tenant.dealsSingularLabel || "Deal",
          contactsLabel: tenant.contactsLabel || "Contacts",
          contactsSingularLabel: tenant.contactsSingularLabel || "Contact",
          companiesLabel: tenant.companiesLabel || "Companies",
          companiesSingularLabel: tenant.companiesSingularLabel || "Company",
        },
      });

      console.log("   ✅ Updated to defaults");
      updatedCount++;
    } else {
      console.log(`✓ Tenant "${tenant.name}" already has all labels`);
    }
  }

  console.log(`\n✨ Done! Updated ${updatedCount} tenant(s)`);

  if (updatedCount === 0) {
    console.log("   All tenants already have proper labels configured.");
  }
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
