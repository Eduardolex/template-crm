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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserAction,
  updateUserAction,
} from "@/lib/actions/user-actions";
import { toast } from "sonner";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "member"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: (user: User) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "member",
          password: "",
        }
      : {
          name: "",
          email: "",
          password: "",
          role: "member",
        },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true);

    try {
      let result;

      if (isEditing && user) {
        // For update, don't send password if empty
        const updateData = {
          name: data.name,
          email: data.email,
          role: data.role,
          ...(data.password ? { password: data.password } : {}),
        };
        result = await updateUserAction(user.id, updateData);
      } else {
        result = await createUserAction(data as CreateUserFormData);
      }

      if (result.success && result.user) {
        toast.success(
          isEditing
            ? "User updated successfully"
            : "User created successfully"
        );
        onSuccess(result.user as User);
        reset();
      } else {
        toast.error(result.error || "Failed to save user");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the team member's information and access level."
              : "Add a new team member to your organization."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing && "(leave blank to keep current)"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEditing ? "Leave blank to keep current" : "At least 6 characters"}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={roleValue}
              onValueChange={(value) =>
                setValue("role", value as "admin" | "member")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  Member - Can manage contacts, deals, and tasks
                </SelectItem>
                <SelectItem value="admin">
                  Admin - Full access including settings
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
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
                : isEditing
                ? "Update User"
                : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
