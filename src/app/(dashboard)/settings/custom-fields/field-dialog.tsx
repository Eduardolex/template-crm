"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomFieldAction } from "@/lib/actions/custom-field-actions";

export function FieldDialog({
  objectType,
  children,
}: {
  objectType: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [options, setOptions] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      objectType,
      key: formData.get("key") as string,
      label: formData.get("label") as string,
      fieldType,
      required: formData.get("required") === "on",
      optionsJsonb:
        fieldType === "select"
          ? options.split("\n").map((opt) => ({
              value: opt.trim().toLowerCase().replace(/\s+/g, "_"),
              label: opt.trim(),
            }))
          : undefined,
    };

    try {
      await createCustomFieldAction(data);
      setOpen(false);
      e.currentTarget.reset();
      setOptions("");
    } catch (err: any) {
      setError(err.message || "Failed to create field");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              name="label"
              placeholder="e.g. Expected Close Date"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Key * (lowercase, underscores only)</Label>
            <Input
              id="key"
              name="key"
              placeholder="e.g. expected_close_date"
              pattern="[a-z_]+"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Field Type *</Label>
            <Select value={fieldType} onValueChange={setFieldType} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Select</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {fieldType === "select" && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (one per line)</Label>
              <textarea
                id="options"
                className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="required" name="required" disabled={loading} />
            <Label htmlFor="required" className="cursor-pointer font-normal">
              Required field
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Field"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
