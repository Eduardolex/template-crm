"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  createNoteAction,
  updateNoteAction,
} from "@/lib/actions/activity-actions";

type Note = {
  id: string;
  body: string;
  contact: { id: string } | null;
  deal: { id: string } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function NoteForm({
  note,
  contacts,
  deals,
  onSuccess,
}: {
  note?: Note;
  contacts: Contact[];
  deals: Deal[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactId, setContactId] = useState(note?.contact?.id || "");
  const [dealId, setDealId] = useState(note?.deal?.id || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      body: formData.get("body") as string,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
    };

    try {
      if (note) {
        await updateNoteAction(note.id, data);
      } else {
        await createNoteAction(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save note");
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
        <Label htmlFor="body">Note Content *</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={note?.body}
          required
          disabled={loading}
          rows={4}
          placeholder="Write your note here..."
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
          {loading ? "Saving..." : note ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
