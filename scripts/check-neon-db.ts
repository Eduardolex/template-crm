/**
 * Script to check the state of the Neon database
 * This will help diagnose why the "New Deal" button isn't showing on Vercel
 */
import dotenv from "dotenv";
dotenv.config(); // Load .env file

import { prisma } from "../src/lib/prisma";

async function checkNeonDatabase() {
  // Use the DATABASE_URL from .env (Neon database)
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in environment");
    process.exit(1);
  }

  console.log("Connecting to database...");
  console.log("URL:", connectionString.substring(0, 30) + "...\n");

  try {
    // Check tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        dealsLabel: true,
        dealsSingularLabel: true,
        contactsLabel: true,
        contactsSingularLabel: true,
        companiesLabel: true,
        companiesSingularLabel: true,
      },
    });

    console.log("=== TENANTS ===");
    if (tenants.length === 0) {
      console.log("❌ NO TENANTS FOUND!");
      console.log("   You need to run the seed script or sign up for an account\n");
    } else {
      tenants.forEach((t) => {
        console.log(`\n✓ Tenant: ${t.name} (${t.slug})`);
        console.log(`  ID: ${t.id}`);

        // Check if labels are set
        if (!t.dealsLabel || !t.dealsSingularLabel) {
          console.log(`  ❌ MISSING LABELS!`);
          console.log(`     dealsLabel: "${t.dealsLabel}"`);
          console.log(`     dealsSingularLabel: "${t.dealsSingularLabel}"`);
          console.log(`     → This will cause the button to not render!`);
        } else {
          console.log(`  ✓ Labels configured:`);
          console.log(`     Deals: "${t.dealsLabel}" / "${t.dealsSingularLabel}"`);
          console.log(`     Contacts: "${t.contactsLabel}" / "${t.contactsSingularLabel}"`);
          console.log(`     Companies: "${t.companiesLabel}" / "${t.companiesSingularLabel}"`);
        }
      });
    }

    // Check pipelines and stages
    for (const tenant of tenants) {
      const pipelines = await prisma.pipeline.findMany({
        where: { tenantId: tenant.id },
        include: {
          stages: {
            orderBy: { position: "asc" },
          },
        },
      });

      console.log(`\n=== PIPELINES for ${tenant.name} ===`);
      if (pipelines.length === 0) {
        console.log("❌ NO PIPELINES FOUND!");
        console.log("   → Deals page will not work without a pipeline\n");
      } else {
        pipelines.forEach((p) => {
          console.log(`\n✓ Pipeline: ${p.name} (ID: ${p.id})`);

          if (p.stages.length === 0) {
            console.log("  ❌ NO STAGES!");
            console.log("     → Cannot create deals without stages");
          } else {
            console.log(`  ✓ Stages (${p.stages.length}):`);
            p.stages.forEach((s) => {
              const flags = [];
              if (s.isWon) flags.push("WON");
              if (s.isLost) flags.push("LOST");
              const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
              console.log(`     ${s.position}. ${s.name}${flagStr}`);
            });
          }
        });
      }

      // Check data counts
      const [users, deals, contacts, companies] = await Promise.all([
        prisma.user.count({ where: { tenantId: tenant.id } }),
        prisma.deal.count({ where: { tenantId: tenant.id } }),
        prisma.contact.count({ where: { tenantId: tenant.id } }),
        prisma.company.count({ where: { tenantId: tenant.id } }),
      ]);

      console.log(`\n=== DATA COUNTS for ${tenant.name} ===`);
      console.log(`  Users: ${users}`);
      console.log(`  Deals: ${deals}`);
      console.log(`  Contacts: ${contacts}`);
      console.log(`  Companies: ${companies}`);
    }

    console.log("\n" + "=".repeat(50));

    // Final diagnosis
    const issues = [];
    for (const tenant of tenants) {
      if (!tenant.dealsLabel || !tenant.dealsSingularLabel) {
        issues.push("❌ Tenant labels are missing");
      }

      const pipelines = await prisma.pipeline.count({ where: { tenantId: tenant.id } });
      if (pipelines === 0) {
        issues.push("❌ No pipeline exists");
      } else {
        const stages = await prisma.stage.count({
          where: { pipeline: { tenantId: tenant.id } },
        });
        if (stages === 0) {
          issues.push("❌ No stages exist in pipeline");
        }
      }
    }

    if (issues.length > 0) {
      console.log("\n🔍 DIAGNOSIS:");
      issues.forEach((issue) => console.log(`  ${issue}`));
      console.log("\n💡 SOLUTION:");
      console.log("  Run: npm run db:seed");
      console.log("  This will create/update the tenant with proper configuration\n");
    } else if (tenants.length > 0) {
      console.log("\n✅ Database looks good!");
      console.log("   All required data is present.\n");
    }

  } catch (error) {
    console.error("\n❌ Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNeonDatabase();
