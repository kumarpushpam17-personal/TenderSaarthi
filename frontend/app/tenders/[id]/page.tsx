import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ExtractionBanner } from "@/components/tenders/ExtractionBanner";
import { TenderStatusBadge } from "@/components/tenders/TenderStatusBadge";
import { fetchTender } from "@/lib/api";

interface TenderOverviewProps {
  params: { id: string };
  searchParams?: { extracting?: string };
}

export default async function TenderOverviewPage({
  params,
  searchParams,
}: TenderOverviewProps) {
  const tender = await fetchTender(params.id);
  const extracting = searchParams?.extracting === "1";
  const nextStep =
    tender.status === "AWAITING_REVIEW"
      ? { href: "review-criteria", label: "Review Criteria", text: "Review the extracted criteria before adding bidders." }
      : tender.status === "CRITERIA_APPROVED"
        ? { href: "bidders", label: "Add Bidders", text: "Add bidders and upload their supporting documents." }
        : tender.status === "EVALUATED"
          ? { href: "audit", label: "Download Report", text: "Evaluation is complete. Review the audit report." }
          : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {extracting ? <ExtractionBanner /> : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <section className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase text-gray-400">Tender</p>
          <h1 className="mt-1 text-lg font-bold text-gray-950">{tender.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{tender.procuring_department}</p>
          <p className="mt-3 text-xs text-gray-400">Source: {tender.source_pdf_uri}</p>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card lg:min-w-44">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Status</p>
          <TenderStatusBadge status={tender.status} />
        </section>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Criteria extracted", value: tender.criteria_count },
          { label: "Bidders added", value: tender.bidder_count },
          { label: "Verdicts", value: tender.verdict_count || "-" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card"
          >
            <p className="text-2xl font-extrabold text-brand">{item.value}</p>
            <p className="mt-1 text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {nextStep ? (
        <div className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-blue-950">Next step: {nextStep.text}</p>
          <Link
            href={`/tenders/${params.id}/${nextStep.href}`}
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            {nextStep.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </main>
  );
}
