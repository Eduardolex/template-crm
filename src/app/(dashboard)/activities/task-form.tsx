"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTaskAction,
  updateTaskAction,
} from "@/lib/actions/task-actions";
import { format } from "date-fns";

type Task = {
  id: string;
  body: string;
  status: string | null;
  dueAt: Date | null;
  assignedUser: { id: string } | null;
  contact: { id: string } | null;
  deal: { id: string } | null;
  automationTemplate: { id: string } | null;
};

type User = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Deal = { id: string; title: string };
type AutomationTemplate = { id: string; name: string; enabled: boolean };

export function TaskForm({
  task,
  users,
  contacts,
  deals,
  automationTemplates,
  onSuccess,
}: {
  task?: Task;
  users: User[];
  contacts: Contact[];
  deals: Deal[];
  automationTemplates: AutomationTemplate[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(task?.status || "todo");
  const [assignedUserId, setAssignedUserId] = useState(
    task?.assignedUser?.id || ""
  );
  const [contactId, setContactId] = useState(task?.contact?.id || "");
  const [dealId, setDealId] = useState(task?.deal?.id || "");
  const [automationTemplateId, setAutomationTemplateId] = useState(
    task?.automationTemplate?.id || ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      body: formData.get("body") as string,
      dueAt: formData.get("dueAt") as string,
      status: status as "todo" | "in_progress" | "done",
      assignedUserId: assignedUserId || undefined,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      automationTemplateId: automationTemplateId || undefined,
    };

    try {
      if (task) {
        await updateTaskAction(task.id, data);
      } else {
        await createTaskAction(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="body">Task Description *</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={task?.body}
          required
          disabled={loading}
          rows={3}
          placeholder="Describe what needs to be done..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status *</Label>
          <Select value={status} onValueChange={setStatus} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueAt">Due Date</Label>
          <Input
            id="dueAt"
            name="dueAt"
            type="date"
            defaultValue={
              task?.dueAt ? format(new Date(task.dueAt), "yyyy-MM-dd") : ""
            }
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assigned To</Label>
        <Select
          value={assignedUserId || undefined}
          onValueChange={setAssignedUserId}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-slate-600">
          Optional: Link to Contact or Deal
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Contact</Label>
              {contactId && (
                <button
                  type="button"
                  onClick={() => setContactId("")}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={contactId || undefined}
              onValueChange={(value) => {
                setContactId(value);
                if (value) setDealId("");
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Deal</Label>
              {dealId && (
                <button
                  type="button"
                  onClick={() => setDealId("")}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={dealId || undefined}
              onValueChange={(value) => {
                setDealId(value);
                if (value) setContactId("");
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Automation Template Section */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Automation (Optional)
          </Label>
          {automationTemplateId && (
            <button
              type="button"
              onClick={() => setAutomationTemplateId("")}
              className="text-xs text-slate-500 hover:text-slate-700"
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          When this task is marked as done, automatically send a follow-up message
        </p>
        <Select
          value={automationTemplateId || undefined}
          onValueChange={setAutomationTemplateId}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="No automation" />
          </SelectTrigger>
          <SelectContent>
            {automationTemplates
              .filter((template) => template.enabled)
              .map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {automationTemplates.filter((t) => t.enabled).length === 0 && (
          <p className="text-xs text-amber-600">
            No automation templates available. Create one in Settings → Automation Templates.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : task ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
