"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { DealCard } from "./deal-card";
import { KanbanColumn } from "./kanban-column";
import { moveDealToStageAction } from "@/lib/actions/deal-actions";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string; name: string };
  contact: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
};

type Stage = { id: string; name: string; position: number };

export function DealsKanban({ deals, stages, dealLabel = "deal", dealsLabel = "deals" }: { deals: Deal[]; stages: Stage[]; dealLabel?: string; dealsLabel?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [optimisticDeals, setOptimisticDeals] = useState(deals);

  // Sync state with props when deals change
  useEffect(() => {
    setOptimisticDeals(deals);
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dealsByStage = stages.map((stage) => ({
    stage,
    deals: optimisticDeals.filter((d) => d.stage.id === stage.id),
  }));

  const activeDeal = activeId ? optimisticDeals.find((d) => d.id === activeId) : null;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;
    const deal = optimisticDeals.find((d) => d.id === dealId);

    if (!deal || deal.stage.id === newStageId) return;

    // Optimistic update
    const newStage = stages.find((s) => s.id === newStageId);
    if (!newStage) return;

    setOptimisticDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    );

    // Server update
    await moveDealToStageAction(dealId, newStageId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {dealsByStage.map(({ stage, deals }) => (
          <KanbanColumn key={stage.id} stage={stage} deals={deals} dealLabel={dealLabel} dealsLabel={dealsLabel} />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCard deal={activeDeal} isDragging dealLabel={dealLabel} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
