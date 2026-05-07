import { Plus } from "lucide-react";
import Link from "next/link";
import { StatsRow } from "@/components/tenders/StatsRow";
import { TenderCard } from "@/components/tenders/TenderCard";
import { fetchTenders } from "@/lib/api";

export default async function TendersPage() {
  const { tenders, stats } = await fetchTenders();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-950">All Tenders</h1>
          <p className="text-sm text-gray-500">{tenders.length} active tenders</p>
        </div>
        <Link
          href="/tenders/new"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          New Tender
        </Link>
      </div>

      <StatsRow stats={stats} />

      <div className="mb-4 flex flex-wrap gap-2">
        {["All (3)", "Awaiting Review (1)", "Evaluated (1)", "Signed (1)"].map(
          (filter, index) => (
            <span
              key={filter}
              className={`rounded border px-3 py-1 text-xs ${
                index === 0
                  ? "border-brand-border bg-brand-bg font-semibold text-brand"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {filter}
            </span>
          )
        )}
      </div>

      <div className="flex flex-col gap-3">
        {tenders.map((tender) => (
          <TenderCard key={tender.id} tender={tender} />
        ))}
      </div>
    </main>
  );
}
