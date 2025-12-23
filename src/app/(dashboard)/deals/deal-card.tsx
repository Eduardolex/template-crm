"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { deleteDealAction } from "@/lib/actions/deal-actions";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  contact: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
};

export function DealCard({ deal, isDragging, dealLabel = "deal" }: { deal: Deal; isDragging?: boolean; dealLabel?: string }) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${dealLabel.toLowerCase()} "${deal.title}"?`)) {
      await deleteDealAction(deal.id);
      setContextMenuOpen(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onContextMenu={handleContextMenu}
        suppressHydrationWarning
        className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm hover:shadow-md ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
      <h4 className="font-medium">{deal.title}</h4>
      <p className="text-sm font-semibold text-green-600">
        ${(deal.valueCents / 100).toLocaleString()}
      </p>
      {deal.contact && (
        <p className="text-xs text-slate-600">
          {deal.contact.firstName} {deal.contact.lastName}
        </p>
      )}
      {deal.company && (
        <p className="text-xs text-slate-600">{deal.company.name}</p>
      )}
      </div>

      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: "fixed",
              left: menuPosition.x,
              top: menuPosition.y,
              width: 0,
              height: 0,
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {dealLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
