"use client";

import { useState } from "react";
import { DealDialog } from "./deal-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Download } from "lucide-react";
import { deleteDealAction } from "@/lib/actions/deal-actions";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string; name: string };
  contact: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
  owner: { name: string };
};

type Stage = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Company = { id: string; name: string };

export function DealsTable({
  deals,
  stages,
  contacts,
  companies,
  dealLabel = "Deal",
  dealsLabel = "Deals",
  contactLabel = "Contact",
  companyLabel = "Company",
}: {
  deals: Deal[];
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  dealLabel?: string;
  dealsLabel?: string;
  contactLabel?: string;
  companyLabel?: string;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${dealLabel.toLowerCase()}?`)) return;
    setDeleting(id);
    await deleteDealAction(id);
    setDeleting(null);
  }

  function exportToCSV() {
    const headers = ["Title", "Value", "Stage", "Contact", "Company"];
    const rows = deals.map((deal) => [
      deal.title,
      `$${(deal.valueCents / 100).toLocaleString()}`,
      deal.stage.name,
      deal.contact
        ? `${deal.contact.firstName} ${deal.contact.lastName}`
        : "",
      deal.company?.name || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${dealLabel.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-slate-600">No {dealsLabel.toLowerCase()} yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      <div className="rounded-lg border bg-white">
        <table className="w-full">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Stage</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{deal.title}</td>
              <td className="px-4 py-3">${(deal.valueCents / 100).toLocaleString()}</td>
              <td className="px-4 py-3">
                <Badge variant="outline">{deal.stage.name}</Badge>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {deal.contact
                  ? `${deal.contact.firstName} ${deal.contact.lastName}`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-slate-600">{deal.company?.name || "-"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <DealDialog
                    deal={deal}
                    stages={stages}
                    contacts={contacts}
                    companies={companies}
                    dealLabel={dealLabel}
                    contactLabel={contactLabel}
                    companyLabel={companyLabel}
                  >
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DealDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(deal.id)}
                    disabled={deleting === deal.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
