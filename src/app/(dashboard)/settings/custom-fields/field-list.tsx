"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FieldDialog } from "./field-dialog";
import { deleteCustomFieldAction } from "@/lib/actions/custom-field-actions";
import { Badge } from "@/components/ui/badge";

type Field = {
  id: string;
  key: string;
  label: string;
  fieldType: string;
  required: boolean;
  optionsJsonb: any;
};

export function FieldList({
  fields,
  objectType,
}: {
  fields: Field[];
  objectType: "contact" | "company" | "deal";
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this field? All values will be lost.")) return;
    setDeleting(id);
    await deleteCustomFieldAction(id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FieldDialog objectType={objectType}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </FieldDialog>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">No custom fields yet. Create your first one!</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Required</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fields.map((field) => (
                <tr key={field.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{field.label}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-600">{field.key}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{field.fieldType}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {field.required ? (
                      <Badge variant="default">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(field.id)}
                      disabled={deleting === field.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
