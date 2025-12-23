"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTenantContext, requireAdmin } from "@/lib/db/tenant-context";

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "member"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Get all users in the current tenant
 */
export async function getUsersAction() {
  try {
    const { tenantId } = await getTenantContext();

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            contacts: true,
            companies: true,
            deals: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users", users: [] };
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUserAction(data: CreateUserInput) {
  try {
    const { tenantId } = await requireAdmin();

    const validated = createUserSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: validated.role,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    revalidatePath("/settings/team");
    revalidatePath("/tasks");

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create user" };
  }
}

/**
 * Update a user (admin only)
 */
export async function updateUserAction(id: string, data: UpdateUserInput) {
  try {
    const { tenantId, userId: currentUserId } = await requireAdmin();

    const validated = updateUserSchema.parse(data);

    // Check if user belongs to this tenant
    const existingUser = await prisma.user.findUnique({
      where: { id, tenantId },
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Check if email is being changed to one that already exists
    if (validated.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (emailExists && emailExists.id !== id) {
        return { success: false, error: "A user with this email already exists" };
      }
    }

    // Prevent removing the last admin
    if (validated.role === "member" && existingUser.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { tenantId, role: "admin" },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot change role: tenant must have at least one admin",
        };
      }
    }

    // Prepare update data
    const updateData: any = {
      name: validated.name,
      email: validated.email,
      role: validated.role,
    };

    // Only update password if provided
    if (validated.password) {
      updateData.passwordHash = await bcrypt.hash(validated.password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id, tenantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    revalidatePath("/settings/team");
    revalidatePath("/tasks");

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update user" };
  }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUserAction(id: string) {
  try {
    const { tenantId, userId: currentUserId } = await requireAdmin();

    // Prevent self-deletion
    if (id === currentUserId) {
      return { success: false, error: "Cannot delete your own account" };
    }

    // Check if user exists and belongs to this tenant
    const user = await prisma.user.findUnique({
      where: { id, tenantId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { tenantId, role: "admin" },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot delete the last admin. Promote another user to admin first.",
        };
      }
    }

    // Check if user owns any data
    const [contactCount, companyCount, dealCount, taskCount] = await Promise.all([
      prisma.contact.count({ where: { ownerUserId: id } }),
      prisma.company.count({ where: { ownerUserId: id } }),
      prisma.deal.count({ where: { ownerUserId: id } }),
      prisma.activity.count({ where: { assignedUserId: id, type: "task" } }),
    ]);

    const totalOwned = contactCount + companyCount + dealCount + taskCount;

    if (totalOwned > 0) {
      return {
        success: false,
        error: `Cannot delete user. They own ${contactCount} contacts, ${companyCount} companies, ${dealCount} deals, and ${taskCount} tasks. Reassign these first.`,
      };
    }

    // Delete user
    await prisma.user.delete({
      where: { id, tenantId },
    });

    revalidatePath("/settings/team");
    revalidatePath("/tasks");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
