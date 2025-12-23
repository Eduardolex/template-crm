"use client";

import { useState } from "react";
import { Plus, Mail, Trash2, Edit, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateDialog } from "./template-dialog";
import {
  deleteAutomationTemplateAction,
  toggleAutomationTemplateAction,
} from "@/lib/actions/automation-template-actions";
import { toast } from "sonner";

type AutomationTemplate = {
  id: string;
  name: string;
  messageTemplate: string;
  sendTo: string;
  customEmail: string | null;
  enabled: boolean;
  createdAt: Date;
};

interface TemplateListProps {
  initialTemplates: AutomationTemplate[];
}

export function TemplateList({ initialTemplates }: TemplateListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<AutomationTemplate | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const result = await deleteAutomationTemplateAction(id);

    if (result.success) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("Template deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete template");
    }
  };

  const handleToggle = async (id: string) => {
    const result = await toggleAutomationTemplateAction(id);

    if (result.success && result.template) {
      setTemplates(
        templates.map((t) => (t.id === id ? result.template! : t))
      );
      toast.success(
        result.template.enabled
          ? "Template enabled"
          : "Template disabled"
      );
    } else {
      toast.error(result.error || "Failed to toggle template");
    }
  };

  const handleEdit = (template: AutomationTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSuccess = (template: AutomationTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
    } else {
      setTemplates([template, ...templates]);
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No automation templates yet
            </h3>
            <p className="text-sm text-slate-600 text-center max-w-md mb-4">
              Create your first automation template to send follow-up messages
              when tasks are completed.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{template.name}</CardTitle>
                      <Badge
                        variant={template.enabled ? "default" : "secondary"}
                      >
                        {template.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1.5">
                      Send to:{" "}
                      {template.sendTo === "contact"
                        ? "Associated Contact"
                        : template.customEmail}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(template.id)}
                      title={
                        template.enabled
                          ? "Disable template"
                          : "Enable template"
                      }
                    >
                      {template.enabled ? (
                        <Power className="h-4 w-4 text-green-600" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">
                    Message Template:
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {template.messageTemplate}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        template={editingTemplate}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
