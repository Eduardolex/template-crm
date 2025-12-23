"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  createAutomationTemplateAction,
  updateAutomationTemplateAction,
} from "@/lib/actions/automation-template-actions";
import { toast } from "sonner";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  messageTemplate: z.string().min(1, "Message template is required"),
  sendTo: z.enum(["contact", "custom"]),
  customEmail: z.string().email().optional().nullable(),
  enabled: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateSchema>;

type AutomationTemplate = {
  id: string;
  name: string;
  messageTemplate: string;
  sendTo: string;
  customEmail: string | null;
  enabled: boolean;
};

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AutomationTemplate | null;
  onSuccess: (template: AutomationTemplate) => void;
}

export function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: TemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template
      ? {
          name: template.name,
          messageTemplate: template.messageTemplate,
          sendTo: template.sendTo as "contact" | "custom",
          customEmail: template.customEmail,
          enabled: template.enabled,
        }
      : {
          name: "",
          messageTemplate: "",
          sendTo: "contact",
          customEmail: null,
          enabled: true,
        },
  });

  const sendToValue = watch("sendTo");

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);

    try {
      const result = template
        ? await updateAutomationTemplateAction(template.id, data)
        : await createAutomationTemplateAction(data);

      if (result.success && result.template) {
        toast.success(
          template
            ? "Template updated successfully"
            : "Template created successfully"
        );
        onSuccess(result.template as AutomationTemplate);
        reset();
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) reset();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create Automation Template"}
          </DialogTitle>
          <DialogDescription>
            Create a reusable template for task completion follow-ups.
            Available variables: {"{contact_name}"}, {"{task_title}"},{" "}
            {"{task_body}"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="e.g., Meeting Follow-up"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Textarea
              id="messageTemplate"
              placeholder="Hi {contact_name},&#10;&#10;Just following up on our meeting about {task_title}...&#10;&#10;Let me know if you have any questions!"
              rows={8}
              {...register("messageTemplate")}
            />
            {errors.messageTemplate && (
              <p className="text-sm text-red-600">
                {errors.messageTemplate.message}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Use {"{contact_name}"} to insert the contact's name, {"{task_title}"} for
              the task title, and {"{task_body}"} for the task description.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sendTo">Send To</Label>
            <Select
              value={sendToValue}
              onValueChange={(value) =>
                setValue("sendTo", value as "contact" | "custom")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Associated Contact</SelectItem>
                <SelectItem value="custom">Custom Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sendToValue === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customEmail">Custom Email</Label>
              <Input
                id="customEmail"
                type="email"
                placeholder="email@example.com"
                {...register("customEmail")}
              />
              {errors.customEmail && (
                <p className="text-sm text-red-600">
                  {errors.customEmail.message}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              {...register("enabled")}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="enabled" className="font-normal">
              Enable this template
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : template
                ? "Update Template"
                : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
