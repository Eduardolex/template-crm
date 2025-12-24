"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCallAction,
  updateCallAction,
} from "@/lib/actions/activity-actions";
import { format } from "date-fns";

type Call = {
  id: string;
  body: string;
  dueAt: Date | null;
  contact: { id: string } | null;
  deal: { id: string } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function CallForm({
  call,
  contacts,
  deals,
  onSuccess,
}: {
  call?: Call;
  contacts: Contact[];
  deals: Deal[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactId, setContactId] = useState(call?.contact?.id || "");
  const [dealId, setDealId] = useState(call?.deal?.id || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      body: formData.get("body") as string,
      dueAt: formData.get("dueAt") as string,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
    };

    try {
      if (call) {
        await updateCallAction(call.id, data);
      } else {
        await createCallAction(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save call");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="body">Call Notes *</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={call?.body}
          required
          disabled={loading}
          rows={4}
          placeholder="Add notes about the call..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueAt">Scheduled Date/Time</Label>
        <Input
          id="dueAt"
          name="dueAt"
          type="datetime-local"
          defaultValue={
            call?.dueAt ? format(new Date(call.dueAt), "yyyy-MM-dd'T'HH:mm") : ""
          }
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-slate-600">
          Optional: Link to Contact or Deal
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Contact</Label>
              {contactId && (
                <button
                  type="button"
                  onClick={() => setContactId("")}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={contactId || undefined}
              onValueChange={(value) => {
                setContactId(value);
                if (value) setDealId("");
              }}
              disabled={loading}
            >
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
            <div className="flex items-center justify-between">
              <Label className="text-xs">Deal</Label>
              {dealId && (
                <button
                  type="button"
                  onClick={() => setDealId("")}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={dealId || undefined}
              onValueChange={(value) => {
                setDealId(value);
                if (value) setContactId("");
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : call ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
