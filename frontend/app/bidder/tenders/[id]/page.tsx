import { ArrowRight, Building2, CalendarClock, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { TenderStatusBadge } from "@/components/tenders/TenderStatusBadge";
import { fetchPublicTender } from "@/lib/api";

export default async function BidderTenderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tender = await fetchPublicTender(params.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <section className="flex-1 rounded-lg border border-gray-200 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase text-brand">Tender Details</p>
          <h1 className="mt-1 text-xl font-bold text-gray-950">{tender.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            {tender.procuring_department}
          </p>
          <p className="mt-3 text-xs text-gray-400">Source: {tender.source_pdf_uri}</p>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-card lg:min-w-56">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Status</p>
          <TenderStatusBadge status={tender.status} />
          <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarClock className="h-3.5 w-3.5" />
            Due {tender.submission_deadline.slice(0, 10)}
          </p>
        </section>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">{tender.criteria_count}</p>
          <p className="mt-1 text-xs text-gray-500">Eligibility criteria</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">{tender.bidder_count}</p>
          <p className="mt-1 text-xs text-gray-500">Submissions received</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">
            {tender.submission_status === "SUBMITTED" ? "Yes" : "No"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Your submission</p>
        </div>
      </div>

      <section className="rounded-lg border border-brand-border bg-brand-bg p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-blue-950">
            <FileCheck2 className="h-4 w-4" />
            Upload firm profile, financial proof, registrations, and supporting certificates.
          </p>
          <Link
            href={`/bidder/tenders/${params.id}/submit`}
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            Start Submission
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
