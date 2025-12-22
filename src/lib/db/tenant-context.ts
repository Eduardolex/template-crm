import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
