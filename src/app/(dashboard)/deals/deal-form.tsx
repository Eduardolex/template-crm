"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDealAction, updateDealAction } from "@/lib/actions/deal-actions";
import { CustomFieldsSection } from "./custom-fields-section";
import { saveCustomFieldValuesAction } from "@/lib/actions/custom-field-actions";


type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string };
  contact: { id: string } | null;
  company: { id: string } | null;
};

type Stage = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Company = { id: string; name: string };

export function DealForm({
  deal,
  stages,
  contacts,
  companies,
  onSuccess,
  dealLabel = "Deal",
  contactLabel = "Contact",
  companyLabel = "Company",
}: {
  deal?: Deal;
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  onSuccess: () => void;
  dealLabel?: string;
  contactLabel?: string;
  companyLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stageId, setStageId] = useState(deal?.stage.id || stages[0]?.id || "");
  const [contactId, setContactId] = useState(deal?.contact?.id || "");
  const [companyId, setCompanyId] = useState(deal?.company?.id || "");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const valueStr = formData.get("value") as string;
    const valueCents = Math.round(parseFloat(valueStr || "0") * 100);

    const data = {
      title: formData.get("title") as string,
      valueCents,
      stageId,
      contactId: contactId || undefined,
      companyId: companyId || undefined,
    };

    try {
      let dealId: string;
      if (deal) {
        await updateDealAction(deal.id, data);
        dealId = deal.id;
      } else {
        const result = await createDealAction(data);
        dealId = result.dealId!;
      }

      // Save custom field values
      if (Object.keys(customFieldValues).length > 0) {
        await saveCustomFieldValuesAction("deal", dealId, customFieldValues);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save deal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{dealLabel} Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={deal?.title}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value (USD) *</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={deal ? (deal.valueCents / 100).toString() : ""}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Stage *</Label>
        <Select value={stageId} onValueChange={setStageId} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{contactLabel}</Label>
          <Select value={contactId || undefined} onValueChange={(value) => setContactId(value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{companyLabel}</Label>
          <Select value={companyId || undefined} onValueChange={(value) => setCompanyId(value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <CustomFieldsSection dealId={deal?.id} onChange={setCustomFieldValues} />
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : deal ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
