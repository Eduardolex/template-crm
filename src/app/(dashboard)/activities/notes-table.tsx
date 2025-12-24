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
import { NoteDialog } from "./note-dialog";
import { deleteNoteAction } from "@/lib/actions/activity-actions";
import { formatDistanceToNow } from "date-fns";

type Note = {
  id: string;
  body: string;
  createdAt: Date;
  contact: { id: string; firstName: string; lastName: string } | null;
  deal: { id: string; title: string } | null;
};

type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };

export function NotesTable({
  notes,
  contacts,
  deals,
}: {
  notes: Note[];
  contacts: Contact[];
  deals: Deal[];
}) {
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    await deleteNoteAction(id);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content</TableHead>
            <TableHead>Related To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-500">
                No notes yet. Create your first note to get started.
              </TableCell>
            </TableRow>
          ) : (
            notes.map((note) => {
              const relatedTo = note.deal
                ? `Deal: ${note.deal.title}`
                : note.contact
                ? `Contact: ${note.contact.firstName} ${note.contact.lastName}`
                : "—";

              const truncatedBody =
                note.body.length > 100
                  ? `${note.body.slice(0, 100)}...`
                  : note.body;

              return (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">
                    {truncatedBody}
                  </TableCell>
                  <TableCell>{relatedTo}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <NoteDialog
                        note={note}
                        contacts={contacts}
                        deals={deals}
                      >
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </NoteDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
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
