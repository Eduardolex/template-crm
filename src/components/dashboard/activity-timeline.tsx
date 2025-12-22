"use client";

import { useState } from "react";
import { ActivityWithRelations } from "@/lib/types/activity";
import { ActivityItem } from "./activity-item";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ActivityTimelineProps {
  activities: ActivityWithRelations[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">
          No recent activity. Start by adding contacts and deals.
        </p>
      </div>
    );
  }

  const displayedActivities = isExpanded ? activities : activities.slice(0, 1);
  const hasMore = activities.length > 1;

  return (
    <div className="relative">
      <div className="relative pr-2">
        {displayedActivities.length > 0 && (
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
        )}
        <div className="relative">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mt-2 ml-4 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show {activities.length - 1} more {activities.length - 1 === 1 ? 'activity' : 'activities'}
            </>
          )}
        </button>
      )}
    </div>
  );
}
