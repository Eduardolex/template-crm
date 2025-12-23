import { Activity, Deal, Contact, User } from "@/lib/generated/client/client";

export type ActivityWithRelations = Activity & {
  deal: { id: string; title: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  assignedUser: { id: string; name: string } | null;
};
