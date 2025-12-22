"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DealForm } from "./deal-form";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string; name: string };
  contact: { id: string } | null;
  company: { id: string } | null;
};

type Stage = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Company = { id: string; name: string };

export function DealDialog({
  deal,
  stages,
  contacts,
  companies,
  children,
}: {
  deal?: Deal;
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>
        <DealForm
          deal={deal}
          stages={stages}
          contacts={contacts}
          companies={companies}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
