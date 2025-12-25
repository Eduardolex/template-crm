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
import { Trash2, MoreVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDealAction } from "@/lib/actions/deal-actions";
import { DealDialog } from "./deal-dialog";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string; name: string };
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
};

type Stage = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };
type Company = { id: string; name: string };

export function DealCard({
  deal,
  isDragging,
  dealLabel = "deal",
  stages,
  contacts,
  companies,
  contactLabel = "Contact",
  companyLabel = "Company"
}: {
  deal: Deal;
  isDragging?: boolean;
  dealLabel?: string;
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  contactLabel?: string;
  companyLabel?: string;
}) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      setDropdownOpen(false);
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
        className={`group cursor-grab rounded-lg border bg-white p-3 shadow-sm hover:shadow-md ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{deal.title}</h4>
            <p className="text-sm font-semibold text-green-600">
              ${(deal.valueCents / 100).toLocaleString()}
            </p>
          </div>

          {/* 3-dot menu button - visible on mobile, hover on desktop */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:opacity-0 md:group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DealDialog
                deal={deal}
                stages={stages}
                contacts={contacts}
                companies={companies}
                dealLabel={dealLabel}
                contactLabel={contactLabel}
                companyLabel={companyLabel}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit {dealLabel}
                </DropdownMenuItem>
              </DealDialog>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {dealLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
          <DealDialog
            deal={deal}
            stages={stages}
            contacts={contacts}
            companies={companies}
            dealLabel={dealLabel}
            contactLabel={contactLabel}
            companyLabel={companyLabel}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit {dealLabel}
            </DropdownMenuItem>
          </DealDialog>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {dealLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
