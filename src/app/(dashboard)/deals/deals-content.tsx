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
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string };
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
  dealLabel?: string;
  dealsLabel?: string;
  contactLabel?: string;
  companyLabel?: string;
}

export function DealsContent({
  deals,
  stages,
  contacts,
  companies,
  view,
  dealLabel = "Deal",
  dealsLabel = "Deals",
  contactLabel = "Contact",
  companyLabel = "Company",
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
          placeholder={`Search ${dealsLabel.toLowerCase()} by title, ${contactLabel.toLowerCase()}, ${companyLabel.toLowerCase()}, or value...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && deals.length > 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">
            No {dealsLabel.toLowerCase()} match your search &quot;{searchQuery}&quot;. Try a different
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
            dealLabel={dealLabel}
            dealsLabel={dealsLabel}
            contactLabel={contactLabel}
            companyLabel={companyLabel}
          />
        ) : (
          <DealsKanban
            deals={filteredDeals}
            stages={stages}
            dealLabel={dealLabel}
            dealsLabel={dealsLabel}
            contacts={contacts}
            companies={companies}
            contactLabel={contactLabel}
            companyLabel={companyLabel}
          />
        ))}

      {/* No Deals at All */}
      {deals.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-slate-600">No {dealsLabel.toLowerCase()} yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
