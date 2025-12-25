"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStageAction, updateStageAction } from "@/lib/actions/pipeline-actions";
import { updateStageAutomationsAction } from "@/lib/actions/stage-automation-actions";

type AutomationTemplate = {
  id: string;
  name: string;
  enabled: boolean;
};

type Stage = {
  id: string;
  name: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
  automations?: Array<{
    automationTemplateId: string;
  }>;
};

export function StageDialog({
  pipelineId,
  stage,
  maxPosition,
  automationTemplates,
  children,
}: {
  pipelineId: string;
  stage?: Stage;
  maxPosition: number;
  automationTemplates: AutomationTemplate[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>(
    stage?.automations?.map(a => a.automationTemplateId) || []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const stageData = {
      name: formData.get("name") as string,
      position: parseInt(formData.get("position") as string),
      isWon: formData.get("isWon") === "on",
      isLost: formData.get("isLost") === "on",
    };

    try {
      let stageId: string;
      if (stage) {
        await updateStageAction(stage.id, stageData);
        stageId = stage.id;
      } else {
        const result = await createStageAction(pipelineId, stageData);
        stageId = result.stageId!;
      }

      // Update automations
      await updateStageAutomationsAction(stageId, {
        automationTemplateIds: selectedAutomations,
      });

      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save stage");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stage ? "Edit Stage" : "New Stage"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Stage Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={stage?.name}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              name="position"
              type="number"
              min="0"
              max={maxPosition}
              defaultValue={stage?.position ?? maxPosition}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isWon"
                name="isWon"
                defaultChecked={stage?.isWon}
                disabled={loading}
              />
              <Label htmlFor="isWon" className="cursor-pointer font-normal">
                Mark as Won stage
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLost"
                name="isLost"
                defaultChecked={stage?.isLost}
                disabled={loading}
              />
              <Label htmlFor="isLost" className="cursor-pointer font-normal">
                Mark as Lost stage
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Automation Templates (Optional)</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {automationTemplates.length === 0 ? (
                <p className="text-sm text-slate-500">No automation templates available</p>
              ) : (
                automationTemplates.map((template) => (
                  <div key={template.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`automation-${template.id}`}
                      checked={selectedAutomations.includes(template.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAutomations([...selectedAutomations, template.id]);
                        } else {
                          setSelectedAutomations(selectedAutomations.filter(id => id !== template.id));
                        }
                      }}
                      disabled={loading}
                    />
                    <Label htmlFor={`automation-${template.id}`} className="font-normal cursor-pointer">
                      {template.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : stage ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
