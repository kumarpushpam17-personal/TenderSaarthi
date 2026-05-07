import type { TenderStatus } from "@/lib/types";

const CONFIG: Record<TenderStatus, { label: string; className: string }> = {
  UPLOADED: { label: "Uploaded", className: "bg-gray-100 text-gray-700" },
  EXTRACTING: { label: "Extracting", className: "bg-blue-100 text-blue-800" },
  AWAITING_REVIEW: {
    label: "Awaiting Review",
    className: "bg-amber-100 text-amber-800",
  },
  CRITERIA_APPROVED: {
    label: "Criteria Approved",
    className: "bg-blue-100 text-blue-800",
  },
  EVALUATING: {
    label: "Evaluating",
    className: "bg-purple-100 text-purple-800",
  },
  EVALUATED: { label: "Evaluated", className: "bg-green-100 text-green-800" },
  SIGNED: { label: "Signed", className: "bg-indigo-100 text-indigo-800" },
};

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  const config = CONFIG[status] ?? CONFIG.UPLOADED;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
