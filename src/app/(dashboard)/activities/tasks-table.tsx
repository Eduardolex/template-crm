"use client";

import { useState } from "react";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Circle, Clock, CheckCircle2 } from "lucide-react";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/lib/actions/task-actions";
import { format } from "date-fns";

type Task = {
  id: string;
  body: string;
  status: string | null;
  dueAt: Date | null;
  assignedUser: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  deal: { id: string; title: string } | null;
  automationTemplate: { id: string; name: string } | null;
};

type User = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };
type AutomationTemplate = { id: string; name: string; enabled: boolean };

const statusConfig = {
  todo: {
    label: "To Do",
    icon: Circle,
    color: "bg-slate-100 text-slate-700",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "bg-blue-100 text-blue-700",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
};

export function TasksTable({
  tasks,
  users,
  contacts,
  deals,
  automationTemplates,
}: {
  tasks: Task[];
  users: User[];
  contacts: Contact[];
  deals: Deal[];
  automationTemplates: AutomationTemplate[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setDeleting(id);
    await deleteTaskAction(id);
    setDeleting(null);
  }

  async function handleStatusChange(
    id: string,
    newStatus: "todo" | "in_progress" | "done"
  ) {
    setUpdatingStatus(id);
    await updateTaskStatusAction(id, newStatus);
    setUpdatingStatus(null);
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-slate-600">No tasks yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table view */}
      <div className="hidden md:block rounded-lg border bg-white">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Linked To
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((task) => {
              const status =
                (task.status as keyof typeof statusConfig) || "todo";
              const StatusIcon = statusConfig[status].icon;

              return (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const statusOrder: Array<keyof typeof statusConfig> = [
                          "todo",
                          "in_progress",
                          "done",
                        ];
                        const currentIndex = statusOrder.indexOf(status);
                        const nextStatus =
                          statusOrder[(currentIndex + 1) % statusOrder.length];
                        handleStatusChange(task.id, nextStatus);
                      }}
                      disabled={updatingStatus === task.id}
                      className="group"
                    >
                      <Badge
                        className={statusConfig[status].color}
                        variant="secondary"
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[status].label}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{task.body}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.assignedUser?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.dueAt
                      ? format(new Date(task.dueAt), "MMM d, yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.deal ? (
                      <span className="text-sm">Deal: {task.deal.title}</span>
                    ) : task.contact ? (
                      <span className="text-sm">
                        Contact: {task.contact.firstName}{" "}
                        {task.contact.lastName}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <TaskDialog
                        task={task}
                        users={users}
                        contacts={contacts}
                        deals={deals}
                        automationTemplates={automationTemplates}
                      >
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TaskDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        disabled={deleting === task.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => {
          const status = (task.status as keyof typeof statusConfig) || "todo";
          const StatusIcon = statusConfig[status].icon;

          return (
            <div key={task.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <button
                  onClick={() => {
                    const statusOrder: Array<keyof typeof statusConfig> = [
                      "todo",
                      "in_progress",
                      "done",
                    ];
                    const currentIndex = statusOrder.indexOf(status);
                    const nextStatus =
                      statusOrder[(currentIndex + 1) % statusOrder.length];
                    handleStatusChange(task.id, nextStatus);
                  }}
                  disabled={updatingStatus === task.id}
                  className="group"
                >
                  <Badge
                    className={statusConfig[status].color}
                    variant="secondary"
                  >
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusConfig[status].label}
                  </Badge>
                </button>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <TaskDialog
                    task={task}
                    users={users}
                    contacts={contacts}
                    deals={deals}
                    automationTemplates={automationTemplates}
                  >
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TaskDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={deleting === task.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="font-medium text-base mb-3">{task.body}</p>
              <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t">
                <div>
                  <span className="text-slate-500">Assigned:</span>
                  <span className="ml-1 block truncate">
                    {task.assignedUser?.name || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Due:</span>
                  <span className="ml-1 block truncate">
                    {task.dueAt
                      ? format(new Date(task.dueAt), "MMM d, yyyy")
                      : "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Linked:</span>
                  <span className="ml-1 truncate">
                    {task.deal ? (
                      `Deal: ${task.deal.title}`
                    ) : task.contact ? (
                      `Contact: ${task.contact.firstName} ${task.contact.lastName}`
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
