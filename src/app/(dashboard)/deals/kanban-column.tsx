import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DealCard } from "./deal-card";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  contact: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
};

type Stage = { id: string; name: string };

export function KanbanColumn({ stage, deals }: { stage: Stage; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, d) => sum + d.valueCents, 0);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="rounded-lg border bg-white">
        <div className="border-b bg-slate-50 px-4 py-3">
          <h3 className="font-medium">{stage.name}</h3>
          <p className="text-sm text-slate-600">
            {deals.length} deals · ${(totalValue / 100).toLocaleString()}
          </p>
        </div>
        <div
          ref={setNodeRef}
          className={`min-h-[200px] space-y-2 p-3 transition-colors ${
            isOver ? "bg-slate-50" : ""
          }`}
        >
          <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </SortableContext>
          {deals.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No deals</p>
          )}
        </div>
      </div>
    </div>
  );
}
