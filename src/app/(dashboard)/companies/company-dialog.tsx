"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyForm } from "./company-form";

type Company = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
};

export function CompanyDialog({
  company,
  companyLabel,
  children,
}: {
  company?: Company;
  companyLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? `Edit ${companyLabel}` : `New ${companyLabel}`}</DialogTitle>
        </DialogHeader>
        <CompanyForm company={company} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
