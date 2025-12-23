"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";

type Task = {
  id: string;
  body: string;
  status: string | null;
  dueAt: Date | null;
  assignedUser: { id: string } | null;
  contact: { id: string } | null;
  deal: { id: string } | null;
  automationTemplate: { id: string } | null;
};

type User = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };
type AutomationTemplate = { id: string; name: string; enabled: boolean };

export function TaskDialog({
  task,
  users,
  contacts,
  deals,
  automationTemplates,
  children,
}: {
  task?: Task;
  users: User[];
  contacts: Contact[];
  deals: Deal[];
  automationTemplates: AutomationTemplate[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <TaskForm
          task={task}
          users={users}
          contacts={contacts}
          deals={deals}
          automationTemplates={automationTemplates}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
