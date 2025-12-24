"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  dealLabel = "Deal",
  contactLabel = "Contact",
  companyLabel = "Company",
  children,
}: {
  deal?: Deal;
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  dealLabel?: string;
  contactLabel?: string;
  companyLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  // Don't render if no stages exist - the form can't work without them
  if (!stages || stages.length === 0) {
    console.error("[DealDialog] No stages available. Cannot create deals without pipeline stages.");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deal ? `Edit ${dealLabel}` : `New ${dealLabel}`}</DialogTitle>
          <DialogDescription>
            {deal ? `Update the details for this ${dealLabel.toLowerCase()}.` : `Create a new ${dealLabel.toLowerCase()} in your pipeline.`}
          </DialogDescription>
        </DialogHeader>
        <DealForm
          deal={deal}
          stages={stages}
          contacts={contacts}
          companies={companies}
          onSuccess={handleSuccess}
          dealLabel={dealLabel}
          contactLabel={contactLabel}
          companyLabel={companyLabel}
        />
      </DialogContent>
    </Dialog>
  );
}
