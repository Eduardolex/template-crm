"use client";

import { useState } from "react";
import { Plus, Users, Trash2, Edit, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserDialog } from "./user-dialog";
import { deleteUserAction } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  _count: {
    contacts: number;
    companies: number;
    deals: number;
    assignedTasks: number;
  };
};

interface TeamListProps {
  initialUsers: User[];
}

export function TeamList({ initialUsers }: TeamListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    const result = await deleteUserAction(id);

    if (result.success) {
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = (user: User) => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
    } else {
      setUsers([{ ...user, _count: { contacts: 0, companies: 0, deals: 0, assignedTasks: 0 } }, ...users]);
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {users.length} {users.length === 1 ? "team member" : "team members"}
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No team members yet
            </h3>
            <p className="text-sm text-slate-600 text-center max-w-md mb-4">
              Add team members to collaborate on contacts, deals, and tasks.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      {user.role === "admin" ? (
                        <Shield className="h-5 w-5 text-slate-600" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {user.email}
                      </CardDescription>
                      <p className="text-xs text-slate-500 mt-1">
                        Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {user._count.contacts}
                    </p>
                    <p className="text-xs text-slate-600">Contacts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {user._count.companies}
                    </p>
                    <p className="text-xs text-slate-600">Companies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {user._count.deals}
                    </p>
                    <p className="text-xs text-slate-600">Deals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {user._count.assignedTasks}
                    </p>
                    <p className="text-xs text-slate-600">Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        user={editingUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
