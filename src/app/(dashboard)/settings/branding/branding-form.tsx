"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const brandingSchema = z.object({
  logoUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export function BrandingForm({
  logoUrl,
  tenantName,
}: {
  logoUrl: string;
  tenantName: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { logoUrl },
  });

  // Watch logoUrl field for live preview
  const watchedLogoUrl = watch("logoUrl");

  async function onSubmit(data: BrandingFormData) {
    setIsSubmitting(true);
    const result = await updateTenantSettingsAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Branding updated successfully");
      setPreviewUrl(data.logoUrl || "");
    } else {
      toast.error(result.error || "Failed to update branding");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
        <CardDescription>
          Provide a URL to your company logo. It will be displayed in the
          sidebar. Recommended size: 200x50px (transparent PNG works best).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              {...register("logoUrl")}
              placeholder="https://example.com/logo.png"
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-600">
                {errors.logoUrl.message}
              </p>
            )}
            <p className="text-sm text-slate-500">
              Enter the full URL including https://. Leave blank to use default text.
            </p>
          </div>

          {/* Live Preview */}
          {watchedLogoUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex h-12 items-center">
                  <img
                    src={watchedLogoUrl}
                    alt={tenantName}
                    className="max-h-10 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">
                This is how your logo will appear in the sidebar.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const form = document.querySelector("form") as HTMLFormElement;
                form?.reset();
                setPreviewUrl(logoUrl);
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
