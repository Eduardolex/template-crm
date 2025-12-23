"use client";

import { useState } from "react";
import { CompanyDialog } from "./company-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { deleteCompanyAction } from "@/lib/actions/company-actions";

type Company = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  owner: { name: string };
};

export function CompaniesTable({ companies, companyLabel = "Company" }: { companies: Company[]; companyLabel?: string }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${companyLabel.toLowerCase()}?`)) return;
    setDeleting(id);
    await deleteCompanyAction(id);
    setDeleting(null);
  }

  function exportToCSV() {
    const headers = ["Name", "Website", "Phone", "Owner"];
    const rows = companies.map((company) => [
      company.name,
      company.website || "",
      company.phone || "",
      company.owner.name,
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
    link.setAttribute("download", `${companyLabel.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-slate-600">No {companyLabel.toLowerCase()}s yet. Create your first one!</p>
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
            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Website</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{company.name}</td>
              <td className="px-4 py-3 text-slate-600">{company.website || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{company.phone || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{company.owner.name}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <CompanyDialog company={company} companyLabel={companyLabel}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CompanyDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                    disabled={deleting === company.id}
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
