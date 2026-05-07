import type { SubmissionStatus } from "@/lib/types";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  READY_FOR_EVALUATION: "bg-green-100 text-green-700",
  NEEDS_CORRECTION: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  PROCESSING: "Processing",
  READY_FOR_EVALUATION: "Ready",
  NEEDS_CORRECTION: "Needs correction",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
