"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteForm } from "./note-form";

type Note = {
  id: string;
  body: string;
  contact: { id: string } | null;
  deal: { id: string } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function NoteDialog({
  note,
  contacts,
  deals,
  children,
}: {
  note?: Note;
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
          <DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>
        <NoteForm
          note={note}
          contacts={contacts}
          deals={deals}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
