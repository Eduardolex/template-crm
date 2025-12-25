"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { StageDialog } from "./stage-dialog";
import { deleteStageAction } from "@/lib/actions/pipeline-actions";
import { Badge } from "@/components/ui/badge";

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
    automationTemplate: { id: string; name: string };
  }>;
};

export function StageList({
  pipelineId,
  stages,
  automationTemplates,
}: {
  pipelineId: string;
  stages: Stage[];
  automationTemplates: AutomationTemplate[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this stage? Deals in this stage will need to be reassigned."))
      return;
    setDeleting(id);
    await deleteStageAction(id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StageDialog pipelineId={pipelineId} maxPosition={stages.length} automationTemplates={automationTemplates}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Stage
          </Button>
        </StageDialog>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">No stages yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-4"
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stage.name}</span>
                  {stage.isWon && <Badge variant="default">Won</Badge>}
                  {stage.isLost && <Badge variant="destructive">Lost</Badge>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-600">Position: {index + 1}</p>
                  {stage.automations && stage.automations.length > 0 && (
                    <>
                      <span className="text-slate-400">•</span>
                      <p className="text-sm text-slate-600">
                        {stage.automations.length} automation{stage.automations.length !== 1 ? 's' : ''}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <StageDialog pipelineId={pipelineId} stage={stage} maxPosition={stages.length} automationTemplates={automationTemplates}>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </StageDialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(stage.id)}
                disabled={deleting === stage.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
