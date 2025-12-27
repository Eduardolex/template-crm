import { prisma } from "@/lib/prisma";  
// Reuse your singleton with adapter
import bcrypt from "bcryptjs";
async function main() {
  console.log("Seeding database...");

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {
      // Update existing tenant with labels if missing
      dealsLabel: "Deals",
      dealsSingularLabel: "Deal",
      contactsLabel: "Contacts",
      contactsSingularLabel: "Contact",
      companiesLabel: "Companies",
      companiesSingularLabel: "Company",
    },
    create: {
      name: "Demo Corp",
      slug: "demo",
      dealsLabel: "Deals",
      dealsSingularLabel: "Deal",
      contactsLabel: "Contacts",
      contactsSingularLabel: "Contact",
      companiesLabel: "Companies",
      companiesSingularLabel: "Company",
    },
  });

  console.log("✓ Created tenant:", tenant.name);

  // Create admin user
  const passwordHash = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Demo User",
      email: "demo@demo.com",
      passwordHash,
      role: "admin",
    },
  });

  console.log("✓ Created user:", user.email);

  // Create pipeline with stages
  const pipeline = await prisma.pipeline.upsert({
    where: { id: `${tenant.id}-default` },
    update: {},
    create: {
      id: `${tenant.id}-default`,
      tenantId: tenant.id,
      name: "Sales Pipeline",
    },
  });

  const stageData = [
    { name: "Lead", position: 0, probabilityPercent: 10, isWon: false, isLost: false },
    { name: "Qualified", position: 1, probabilityPercent: 25, isWon: false, isLost: false },
    { name: "Proposal", position: 2, probabilityPercent: 50, isWon: false, isLost: false },
    { name: "Negotiation", position: 3, probabilityPercent: 75, isWon: false, isLost: false },
    { name: "Closed Won", position: 4, probabilityPercent: 100, isWon: true, isLost: false },
    { name: "Closed Lost", position: 5, probabilityPercent: 0, isWon: false, isLost: true },
  ];

  const stages = [];
  for (const data of stageData) {
    const stage = await prisma.stage.upsert({
      where: { id: `${pipeline.id}-${data.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `${pipeline.id}-${data.name.toLowerCase().replace(/\s+/g, "-")}`,
        pipelineId: pipeline.id,
        ...data,
      },
    });
    stages.push(stage);
  }

  console.log("✓ Created", stages.length, "stages");

  // Create contacts
  const contactNames = [
    ["Sarah", "Johnson"],
    ["Michael", "Chen"],
    ["Emily", "Rodriguez"],
    ["David", "Kim"],
    ["Jessica", "Williams"],
    ["James", "Brown"],
    ["Maria", "Garcia"],
    ["Robert", "Martinez"],
    ["Linda", "Anderson"],
    ["William", "Taylor"],
  ];

  const contacts = [];
  for (const [firstName, lastName] of contactNames) {
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const contact = await prisma.contact.create({
      data: {
        tenantId: tenant.id,
        ownerUserId: user.id,
        firstName,
        lastName,
        email,
        phone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      },
    });
    contacts.push(contact);
  }

  console.log("✓ Created", contacts.length, "contacts");

  // Create companies
  const companyNames = [
    "TechCorp Solutions",
    "Global Innovations Inc",
    "DataFlow Systems",
    "CloudMasters LLC",
    "NextGen Enterprises",
  ];

  const companies = [];
  for (const name of companyNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const company = await prisma.company.create({
      data: {
        tenantId: tenant.id,
        ownerUserId: user.id,
        name,
        website: `https://www.${slug}.com`,
        phone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      },
    });
    companies.push(company);
  }

  console.log("✓ Created", companies.length, "companies");

  // Create deals
  const dealTitles = [
    "Enterprise License",
    "Annual Support Contract",
    "Custom Integration",
    "Cloud Migration",
    "Security Audit",
    "Training Package",
    "API Access",
    "Premium Subscription",
    "Consulting Services",
    "Infrastructure Upgrade",
    "Data Analytics Platform",
    "Mobile App Development",
  ];

  let dealCount = 0;
  for (let i = 0; i < dealTitles.length; i++) {
    const stageIndex = i % stages.length;
    const contact = contacts[i % contacts.length];
    const company = i < companies.length ? companies[i] : null;
    const value = Math.floor(Math.random() * 50000) + 5000;

    await prisma.deal.create({
      data: {
        tenantId: tenant.id,
        pipelineId: pipeline.id,
        stageId: stages[stageIndex].id,
        ownerUserId: user.id,
        contactId: contact.id,
        companyId: company?.id,
        title: dealTitles[i],
        valueCents: value * 100,
      },
    });
    dealCount++;
  }

  console.log("✓ Created", dealCount, "deals");

  console.log("\n✅ Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("Email: demo@demo.com");
  console.log("Password: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
