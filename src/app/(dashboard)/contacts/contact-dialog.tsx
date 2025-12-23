"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "./contact-form";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export function ContactDialog({
  contact,
  contactLabel,
  children,
}: {
  contact?: Contact;
  contactLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? `Edit ${contactLabel}` : `New ${contactLabel}`}</DialogTitle>
        </DialogHeader>
        <ContactForm contact={contact} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
