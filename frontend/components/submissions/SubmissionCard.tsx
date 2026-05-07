import { AlertTriangle, CheckCircle2, FileText, Mail } from "lucide-react";
import type { BidderSubmission } from "@/lib/types";
import { DocumentBadge } from "@/components/bidders/DocumentBadge";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

export function SubmissionCard({ submission }: { submission: BidderSubmission }) {
  const correctionCount = submission.processing_summary.needs_correction;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-950">{submission.legal_name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{submission.contact_email}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Submitted {submission.submitted_at.slice(0, 10)}
          </p>
        </div>
        <SubmissionStatusBadge status={submission.status} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-gray-50 px-3 py-2">
          <p className="text-lg font-bold text-brand">{submission.document_count}</p>
          <p className="text-xs text-gray-500">Documents</p>
        </div>
        <div className="rounded-md bg-gray-50 px-3 py-2">
          <p className="text-lg font-bold text-brand">
            {submission.processing_summary.criteria_matched}
          </p>
          <p className="text-xs text-gray-500">Criteria matched</p>
        </div>
        <div className="rounded-md bg-gray-50 px-3 py-2">
          <p className="flex items-center gap-1 text-lg font-bold text-brand">
            {correctionCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            {correctionCount}
          </p>
          <p className="text-xs text-gray-500">Corrections</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {submission.documents.map((document) => (
          <div
            key={document.id}
            className="flex max-w-full items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 py-1"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="max-w-48 truncate text-xs text-gray-700" title={document.filename}>
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
