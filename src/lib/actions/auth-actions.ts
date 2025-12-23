"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  tenantName: z.string().min(2, "Company name must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupAction(data: z.infer<typeof signupSchema>) {
  try {
    const validated = signupSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Create tenant slug from name
    const slug = validated.tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return {
        success: false,
        error: "Company name already taken, please choose another",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: validated.tenantName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: validated.name,
          email: validated.email,
          passwordHash,
          role: "admin",
        },
      });

      // Create default pipeline with stages
      const pipeline = await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: "Sales Pipeline",
          stages: {
            create: [
              { name: "Lead", position: 0, isWon: false, isLost: false },
              { name: "Qualified", position: 1, isWon: false, isLost: false },
              { name: "Proposal", position: 2, isWon: false, isLost: false },
              { name: "Negotiation", position: 3, isWon: false, isLost: false },
              { name: "Closed Won", position: 4, isWon: true, isLost: false },
              { name: "Closed Lost", position: 5, isWon: false, isLost: true },
            ],
          },
        },
      });

      return { tenant, user, pipeline };
    });

    return {
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    console.error("Signup error:", error);
    return {
      success: false,
      error: "An error occurred during signup. Please try again.",
    };
  }
}
