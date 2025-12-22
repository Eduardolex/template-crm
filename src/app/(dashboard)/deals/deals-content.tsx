"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DealsKanban } from "./deals-kanban";
import { DealsTable } from "./deals-table";

type Deal = {
  id: string;
  title: string;
  valueCents: number;
  stage: { id: string; name: string };
  contact: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
  owner: { name: string };
};

type Stage = { id: string; name: string; position: number };
type Contact = { id: string; firstName: string; lastName: string };
type Company = { id: string; name: string };

interface DealsContentProps {
  deals: Deal[];
  stages: Stage[];
  contacts: Contact[];
  companies: Company[];
  view: string;
}

export function DealsContent({
  deals,
  stages,
  contacts,
  companies,
  view,
}: DealsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter deals based on search query
  const filteredDeals = deals.filter((deal) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Title match
    if (deal.title.toLowerCase().includes(query)) return true;

    // Contact name match
    if (deal.contact) {
      const fullName =
        `${deal.contact.firstName} ${deal.contact.lastName}`.toLowerCase();
      if (fullName.includes(query)) return true;
    }

    // Company match
    if (deal.company?.name.toLowerCase().includes(query)) return true;

    // Value match (strip $ and commas)
    const numericQuery = query.replace(/[$,]/g, "");
    if (numericQuery && !isNaN(Number(numericQuery))) {
      const dealValue = (deal.valueCents / 100).toString();
      if (dealValue.includes(numericQuery)) return true;
    }

    return false;
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search deals by title, contact, company, or value..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && deals.length > 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">
            No deals match your search &quot;{searchQuery}&quot;. Try a different
            search term.
          </p>
        </div>
      )}

      {/* Views */}
      {filteredDeals.length > 0 &&
        (view === "list" ? (
          <DealsTable
            deals={filteredDeals}
            stages={stages}
            contacts={contacts}
            companies={companies}
          />
        ) : (
          <DealsKanban deals={filteredDeals} stages={stages} />
        ))}

      {/* No Deals at All */}
      {deals.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">No deals yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
