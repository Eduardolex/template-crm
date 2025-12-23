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
import { updateEntityLabelsAction } from "@/lib/actions/entity-labels-actions";
import { toast } from "sonner";

const labelsSchema = z.object({
  dealsLabel: z.string().min(1, "Deals label is required").max(50),
  dealsSingularLabel: z.string().min(1, "Deal singular label is required").max(50),
  contactsLabel: z.string().min(1, "Contacts label is required").max(50),
  contactsSingularLabel: z.string().min(1, "Contact singular label is required").max(50),
  companiesLabel: z.string().min(1, "Companies label is required").max(50),
  companiesSingularLabel: z.string().min(1, "Company singular label is required").max(50),
});

type LabelsFormData = z.infer<typeof labelsSchema>;

export function LabelsForm({
  dealsLabel,
  dealsSingularLabel,
  contactsLabel,
  contactsSingularLabel,
  companiesLabel,
  companiesSingularLabel,
}: {
  dealsLabel: string;
  dealsSingularLabel: string;
  contactsLabel: string;
  contactsSingularLabel: string;
  companiesLabel: string;
  companiesSingularLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LabelsFormData>({
    resolver: zodResolver(labelsSchema),
    defaultValues: {
      dealsLabel,
      dealsSingularLabel,
      contactsLabel,
      contactsSingularLabel,
      companiesLabel,
      companiesSingularLabel,
    },
  });

  async function onSubmit(data: LabelsFormData) {
    setIsSubmitting(true);
    const result = await updateEntityLabelsAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Entity labels updated successfully");
    } else {
      toast.error(result.error || "Failed to update labels");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Entity Labels</CardTitle>
        <CardDescription>
          Specify both singular and plural forms for each entity type. These labels
          will be used throughout your CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Deals Labels */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Deals / Opportunities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealsSingularLabel">Singular Form</Label>
                <Input
                  id="dealsSingularLabel"
                  {...register("dealsSingularLabel")}
                  placeholder="e.g., Deal, Opportunity"
                />
                {errors.dealsSingularLabel && (
                  <p className="text-sm text-red-600">
                    {errors.dealsSingularLabel.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealsLabel">Plural Form</Label>
                <Input
                  id="dealsLabel"
                  {...register("dealsLabel")}
                  placeholder="e.g., Deals, Opportunities"
                />
                {errors.dealsLabel && (
                  <p className="text-sm text-red-600">
                    {errors.dealsLabel.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contacts Labels */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Contacts / Clients</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactsSingularLabel">Singular Form</Label>
                <Input
                  id="contactsSingularLabel"
                  {...register("contactsSingularLabel")}
                  placeholder="e.g., Contact, Client"
                />
                {errors.contactsSingularLabel && (
                  <p className="text-sm text-red-600">
                    {errors.contactsSingularLabel.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactsLabel">Plural Form</Label>
                <Input
                  id="contactsLabel"
                  {...register("contactsLabel")}
                  placeholder="e.g., Contacts, Clients"
                />
                {errors.contactsLabel && (
                  <p className="text-sm text-red-600">
                    {errors.contactsLabel.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Companies Labels */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Companies / Organizations</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companiesSingularLabel">Singular Form</Label>
                <Input
                  id="companiesSingularLabel"
                  {...register("companiesSingularLabel")}
                  placeholder="e.g., Company, Organization"
                />
                {errors.companiesSingularLabel && (
                  <p className="text-sm text-red-600">
                    {errors.companiesSingularLabel.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companiesLabel">Plural Form</Label>
                <Input
                  id="companiesLabel"
                  {...register("companiesLabel")}
                  placeholder="e.g., Companies, Organizations"
                />
                {errors.companiesLabel && (
                  <p className="text-sm text-red-600">
                    {errors.companiesLabel.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
