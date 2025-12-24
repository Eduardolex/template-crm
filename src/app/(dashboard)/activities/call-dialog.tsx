"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CallForm } from "./call-form";

type Call = {
  id: string;
  body: string;
  dueAt: Date | null;
  contact: { id: string } | null;
  deal: { id: string } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function CallDialog({
  call,
  contacts,
  deals,
  children,
}: {
  call?: Call;
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
          <DialogTitle>{call ? "Edit Call" : "New Call"}</DialogTitle>
        </DialogHeader>
        <CallForm
          call={call}
          contacts={contacts}
          deals={deals}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
