"use client";

import { useState } from "react";
import { ContactDialog } from "./contact-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { deleteContactAction } from "@/lib/actions/contact-actions";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  owner: { name: string };
};

export function ContactsTable({ contacts, contactLabel = "Contact" }: { contacts: Contact[]; contactLabel?: string }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${contactLabel.toLowerCase()}?`)) return;
    setDeleting(id);
    await deleteContactAction(id);
    setDeleting(null);
  }

  function exportToCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Owner"];
    const rows = contacts.map((contact) => [
      contact.firstName,
      contact.lastName,
      contact.email || "",
      contact.phone || "",
      contact.owner.name,
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
    link.setAttribute("download", `${contactLabel.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-slate-600">No {contactLabel.toLowerCase()}s yet. Create your first one!</p>
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
            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                {contact.firstName} {contact.lastName}
              </td>
              <td className="px-4 py-3 text-slate-600">{contact.email || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{contact.phone || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{contact.owner.name}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <ContactDialog contact={contact} contactLabel={contactLabel}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </ContactDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    disabled={deleting === contact.id}
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
