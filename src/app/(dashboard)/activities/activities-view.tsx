"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { NoteDialog } from "./note-dialog";
import { CallDialog } from "./call-dialog";
import { TasksTable } from "./tasks-table";
import { NotesTable } from "./notes-table";
import { CallsTable } from "./calls-table";

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

type User = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };
type AutomationTemplate = { id: string; name: string; enabled: boolean };

export function ActivitiesView({
  activities,
  users,
  contacts,
  deals,
  automationTemplates,
}: {
  activities: Activity[];
  users: User[];
  contacts: Contact[];
  deals: Deal[];
  automationTemplates: AutomationTemplate[];
}) {
  const tasks = activities.filter((a) => a.type === "task");
  const notes = activities.filter((a) => a.type === "note");
  const calls = activities.filter((a) => a.type === "call");

  return (
    <Tabs defaultValue="tasks" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="calls">Calls ({calls.length})</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tasks" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-slate-600">Manage your tasks and to-dos</p>
          </div>
          <TaskDialog
            users={users}
            contacts={contacts}
            deals={deals}
            automationTemplates={automationTemplates}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </TaskDialog>
        </div>
        <TasksTable
          tasks={tasks}
          users={users}
          contacts={contacts}
          deals={deals}
          automationTemplates={automationTemplates}
        />
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Notes</h2>
            <p className="text-slate-600">Keep track of important information</p>
          </div>
          <NoteDialog contacts={contacts} deals={deals}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </NoteDialog>
        </div>
        <NotesTable notes={notes} contacts={contacts} deals={deals} />
      </TabsContent>

      <TabsContent value="calls" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Calls</h2>
            <p className="text-slate-600">Schedule and log your calls</p>
          </div>
          <CallDialog contacts={contacts} deals={deals}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Call
            </Button>
          </CallDialog>
        </div>
        <CallsTable calls={calls} contacts={contacts} deals={deals} />
      </TabsContent>
    </Tabs>
  );
}
