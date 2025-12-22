"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CustomField = {
  id: string;
  key: string;
  label: string;
  fieldType: string;
  required: boolean;
  optionsJsonb: { value: string; label: string }[] | null;
};

export function CustomFieldsSection({
  dealId,
  onChange,
}: {
  dealId?: string;
  onChange: (values: Record<string, any>) => void;
}) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await fetch("/api/custom-fields?objectType=deal");
        const data = await res.json();
        setFields(data);
      } catch (err) {
        console.error("Failed to load custom fields:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, []);

  function handleChange(fieldId: string, value: any) {
    const newValues = { ...values, [fieldId]: value };
    setValues(newValues);
    onChange(newValues);
  }

  if (loading) return <div className="text-sm text-slate-500">Loading custom fields...</div>;
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-medium">Custom Fields</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>
            {field.fieldType === "text" && (
              <Input
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.fieldType === "number" && (
              <Input
                type="number"
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, parseFloat(e.target.value))}
                required={field.required}
              />
            )}
            {field.fieldType === "date" && (
              <Input
                type="date"
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.fieldType === "select" && field.optionsJsonb && (
              <Select
                value={values[field.id] || ""}
                onValueChange={(v) => handleChange(field.id, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.optionsJsonb.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
