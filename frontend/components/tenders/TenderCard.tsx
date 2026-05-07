import { ArrowRight, Building2, FileCheck2, Users } from "lucide-react";
import Link from "next/link";
import type { TenderSummary } from "@/lib/types";
import { TenderStatusBadge } from "./TenderStatusBadge";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(diff / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function TenderCard({ tender }: { tender: TenderSummary }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-card transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-950">{tender.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {tender.procuring_department} · Uploaded {timeAgo(tender.uploaded_at)}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FileCheck2 className="h-3.5 w-3.5" />
            {tender.criteria_count}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {tender.bidder_count}
          </span>
        </div>
        <TenderStatusBadge status={tender.status} />
        <Link
          href={`/tenders/${tender.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
