import { FileText } from "lucide-react";
import type { Bidder } from "@/lib/types";
import { DocumentBadge } from "./DocumentBadge";

export function BidderCard({ bidder }: { bidder: Bidder }) {
  const enoughDocuments = bidder.documents.length >= 3;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-950">{bidder.legal_name}</p>
          <p className="mt-0.5 text-xs text-gray-400">Uploaded {bidder.uploaded_at.slice(0, 10)}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            enoughDocuments ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {bidder.documents.length} docs
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {bidder.documents.map((document) => (
          <div
            key={document.id}
            className="flex max-w-full items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 py-1"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="max-w-44 truncate text-xs text-gray-700" title={document.filename}>
              {document.filename}
            </span>
            <DocumentBadge
              languages={document.detected_languages}
              docType={document.document_type}
            />
          </div>
        ))}
      </div>
    </article>
  );
}
