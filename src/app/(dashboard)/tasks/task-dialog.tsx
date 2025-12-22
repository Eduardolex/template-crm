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
};

type User = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function TaskDialog({
  task,
  users,
  contacts,
  deals,
  children,
}: {
  task?: Task;
  users: User[];
  contacts: Contact[];
  deals: Deal[];
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
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
