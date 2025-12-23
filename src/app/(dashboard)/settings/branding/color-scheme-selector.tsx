"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateTenantSettingsAction } from "@/lib/actions/tenant-settings-actions";
import { toast } from "sonner";
import { COLOR_PRESETS } from "@/lib/color-presets";
import type { ColorPreset } from "@/lib/color-presets";

export function ColorSchemeSelector({
  currentScheme,
}: {
  currentScheme: string;
}) {
  const [selectedScheme, setSelectedScheme] = useState(currentScheme);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (selectedScheme === currentScheme) {
      toast.info("No changes to save");
      return;
    }

    setIsSubmitting(true);
    const result = await updateTenantSettingsAction({
      colorScheme: selectedScheme,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Color scheme updated successfully");
      // Page will auto-refresh due to revalidatePath
    } else {
      toast.error(result.error || "Failed to update color scheme");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Scheme</CardTitle>
        <CardDescription>
          Choose a preset color scheme for your CRM. This affects the primary
          brand color, sidebar appearance, and accent colors throughout the
          application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COLOR_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={selectedScheme === preset.id}
              onClick={() => setSelectedScheme(preset.id)}
            />
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedScheme(currentScheme)}
            disabled={selectedScheme === currentScheme}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || selectedScheme === currentScheme}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PresetCard({
  preset,
  isSelected,
  onClick,
}: {
  preset: ColorPreset;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 p-4 text-left transition-all hover:border-gray-400",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-gray-200"
      )}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Preset Name */}
      <div className="mb-3">
        <h3 className="font-semibold">{preset.name}</h3>
        <p className="text-xs text-slate-600">{preset.description}</p>
      </div>

      {/* Color Swatches */}
      <div className="flex gap-2">
        <div
          className="h-12 w-full rounded border"
          style={{
            backgroundColor: preset.preview.primary,
          }}
          title="Primary Color"
        />
        <div
          className="h-12 w-full rounded border"
          style={{
            backgroundColor: preset.preview.sidebar,
          }}
          title="Sidebar Color"
        />
        <div
          className="h-12 w-full rounded border"
          style={{
            backgroundColor: preset.preview.accent,
          }}
          title="Accent Color"
        />
      </div>
    </button>
  );
}
