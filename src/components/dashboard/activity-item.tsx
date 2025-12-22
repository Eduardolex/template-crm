import { formatDistanceToNow, format } from "date-fns";
import { MessageSquare, CheckSquare, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActivityWithRelations } from "@/lib/types/activity";

interface ActivityItemProps {
  activity: ActivityWithRelations;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const isOld = new Date().getTime() - new Date(activity.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;
  const timestamp = isOld
    ? format(new Date(activity.createdAt), "MMM d, yyyy")
    : formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

  const Icon = activity.type === "note"
    ? MessageSquare
    : activity.type === "task"
    ? CheckSquare
    : Phone;

  const badgeVariant = activity.type === "note"
    ? "secondary"
    : activity.type === "call"
    ? "default"
    : activity.status === "done"
    ? "default"
    : activity.status === "in_progress"
    ? "default"
    : "secondary";

  const truncatedBody = activity.body.length > 200
    ? `${activity.body.slice(0, 200)}...`
    : activity.body;

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const relatedEntity = activity.deal
    ? `Deal: ${activity.deal.title}`
    : activity.contact
    ? `Contact: ${activity.contact.firstName} ${activity.contact.lastName}`
    : null;

  return (
    <div className="flex gap-3 pb-6 last:pb-0">
      {activity.assignedUser ? (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
            {getInitials(activity.assignedUser.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-500" />
          <Badge variant={badgeVariant} className="text-xs">
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            {activity.type === "task" && activity.status && ` - ${activity.status.replace("_", " ")}`}
          </Badge>
          <span className="text-xs text-slate-500 ml-auto">{timestamp}</span>
        </div>

        <p className="text-sm text-slate-700">{truncatedBody}</p>

        {relatedEntity && (
          <p className="text-xs text-slate-500">{relatedEntity}</p>
        )}
      </div>
    </div>
  );
}
