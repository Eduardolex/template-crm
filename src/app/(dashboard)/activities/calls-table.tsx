"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CallDialog } from "./call-dialog";
import { deleteCallAction } from "@/lib/actions/activity-actions";
import { formatDistanceToNow, format } from "date-fns";

type Activity = {
  id: string;
  type: string;
  body: string;
  status: string | null;
  dueAt: Date | null;
  createdAt: Date;
  assignedUser: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  deal: { id: string; title: string } | null;
  automationTemplate: { id: string; name: string; enabled: boolean } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function CallsTable({
  calls,
  contacts,
  deals,
}: {
  calls: Activity[];
  contacts: Contact[];
  deals: Deal[];
}) {
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this call?")) return;
    await deleteCallAction(id);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Notes</TableHead>
            <TableHead>Related To</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-500">
                No calls yet. Create your first call to get started.
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => {
              const relatedTo = call.deal
                ? `Deal: ${call.deal.title}`
                : call.contact
                ? `Contact: ${call.contact.firstName} ${call.contact.lastName}`
                : "—";

              const truncatedBody =
                call.body.length > 100
                  ? `${call.body.slice(0, 100)}...`
                  : call.body;

              const scheduled = call.dueAt
                ? format(new Date(call.dueAt), "MMM d, yyyy h:mm a")
                : "—";

              return (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">
                    {truncatedBody}
                  </TableCell>
                  <TableCell>{relatedTo}</TableCell>
                  <TableCell>{scheduled}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(call.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CallDialog
                        call={call}
                        contacts={contacts}
                        deals={deals}
                      >
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </CallDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(call.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
