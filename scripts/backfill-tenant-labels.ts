import { prisma } from "@/lib/prisma";

async function backfillTenantLabels() {
  console.log("Backfilling tenant labels...");

  // Update all tenants that have NULL or empty labels
  const result = await prisma.tenant.updateMany({
    where: {
      OR: [
        { dealsLabel: null },
        { dealsLabel: "" },
      ],
    },
    data: {
      dealsLabel: "Deals",
      dealsSingularLabel: "Deal",
      contactsLabel: "Contacts",
      contactsSingularLabel: "Contact",
      companiesLabel: "Companies",
      companiesSingularLabel: "Company",
    },
  });

  console.log(`✓ Updated ${result.count} tenant(s)`);

  // Verify all tenants now have labels
  const tenants = await prisma.tenant.findMany({
    select: {
      name: true,
      slug: true,
      dealsLabel: true,
      contactsLabel: true,
      companiesLabel: true,
    },
  });

  console.log("\nCurrent tenant labels:");
  tenants.forEach((t) => {
    console.log(`  ${t.name} (${t.slug}):`);
    console.log(`    Deals: ${t.dealsLabel}`);
    console.log(`    Contacts: ${t.contactsLabel}`);
    console.log(`    Companies: ${t.companiesLabel}`);
  });

  console.log("\n✅ Backfill complete!");
}

backfillTenantLabels()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
