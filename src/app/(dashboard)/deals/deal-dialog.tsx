"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  const canUseForm = Array.isArray(stages) && stages.length > 0;

  const handleSuccess = () => {
    setOpen(false);
  };

  // If stages are missing, do NOT disappear entirely (that makes it look "not rendering").
  // Render the trigger but disable opening + show a message if opened somehow.
  const handleOpenChange = (next: boolean) => {
    if (!canUseForm) {
      console.error(
        "[DealDialog] No stages available. Cannot create deals without pipeline stages."
      );
      setOpen(false);
      return;
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* Keep the button visible, but disable interaction if the dialog can't work */}
        <span
          aria-disabled={!canUseForm}
          title={
            canUseForm
              ? undefined
              : "Create pipeline stages first to create deals."
          }
          className={!canUseForm ? "pointer-events-none opacity-50" : undefined}
        >
          {children}
        </span>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {deal ? `Edit ${dealLabel}` : `New ${dealLabel}`}
          </DialogTitle>
          <DialogDescription>
            {deal
              ? `Update the details for this ${dealLabel.toLowerCase()}.`
              : `Create a new ${dealLabel.toLowerCase()} in your pipeline.`}
          </DialogDescription>
        </DialogHeader>

        {!canUseForm ? (
          <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-700">
            You need at least one pipeline stage before you can create a{" "}
            {dealLabel.toLowerCase()}.
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
