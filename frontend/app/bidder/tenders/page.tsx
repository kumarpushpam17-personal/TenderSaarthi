import { ArrowRight, CalendarClock, FileText } from "lucide-react";
import Link from "next/link";
import { TenderStatusBadge } from "@/components/tenders/TenderStatusBadge";
import { fetchPublicTenders } from "@/lib/api";

export default async function BidderTendersPage() {
  const tenders = await fetchPublicTenders();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-brand">Bidder Workspace</p>
        <h1 className="mt-1 text-xl font-bold text-gray-950">Open Tenders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a tender, review the requirements, and submit your firm documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenders.map((tender) => (
          <article
            key={tender.id}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-card"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-gray-950">{tender.title}</p>
                <p className="mt-1 text-sm text-gray-500">{tender.procuring_department}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Submit by {tender.submission_deadline.slice(0, 10)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TenderStatusBadge status={tender.status} />
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                  {tender.submission_status === "SUBMITTED" ? "Submitted" : "Not started"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <FileText className="h-3.5 w-3.5" />
                {tender.criteria_count} criteria available for matching after submission
              </p>
              <Link
                href={`/bidder/tenders/${tender.id}`}
                className="inline-flex w-fit items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Open Tender
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
