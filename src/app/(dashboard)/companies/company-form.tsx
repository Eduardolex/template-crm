"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompanyAction, updateCompanyAction } from "@/lib/actions/company-actions";

type Company = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
};

export function CompanyForm({
  company,
  onSuccess,
}: {
  company?: Company;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      website: formData.get("website") as string,
      phone: formData.get("phone") as string,
    };

    try {
      if (company) {
        await updateCompanyAction(company.id, data);
      } else {
        await createCompanyAction(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Company Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={company?.name}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://example.com"
          defaultValue={company?.website || ""}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={company?.phone || ""}
          disabled={loading}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : company ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
