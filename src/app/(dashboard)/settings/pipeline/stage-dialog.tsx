"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStageAction, updateStageAction } from "@/lib/actions/pipeline-actions";

type Stage = {
  id: string;
  name: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
};

export function StageDialog({
  pipelineId,
  stage,
  maxPosition,
  children,
}: {
  pipelineId: string;
  stage?: Stage;
  maxPosition: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      position: parseInt(formData.get("position") as string),
      isWon: formData.get("isWon") === "on",
      isLost: formData.get("isLost") === "on",
    };

    try {
      if (stage) {
        await updateStageAction(stage.id, data);
      } else {
        await createStageAction(pipelineId, data);
      }
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
