import { CheckCircle2, RotateCcw, X } from "lucide-react";
import type { Criterion, VerdictResult } from "@/lib/types";

interface VerdictSidePanelProps {
  result: VerdictResult;
  criterion: Criterion | undefined;
  bidderName: string;
  onClose: () => void;
  onApprove: () => void;
  onOverride: (reason: string) => void;
}

function ConfidenceBar({
  label,
  value,
  pass,
}: {
  label: string;
  value: number | null;
  pass?: boolean;
}) {
  const percent = value === null ? (pass ? 100 : 0) : Math.round(value * 100);
  const color =
    value === null
      ? pass
        ? "bg-green-500"
        : "bg-red-500"
      : value >= 0.85
        ? "bg-green-500"
        : value >= 0.7
          ? "bg-amber-400"
          : "bg-red-500";

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">
          {value === null ? (pass ? "Pass" : "Fail") : `${percent}%`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

const VERDICT_STYLE = {
  ELIGIBLE: {
    label: "ELIGIBLE",
    className: "border-green-200 bg-green-50 text-green-800",
  },
  NOT_ELIGIBLE: {
    label: "NOT ELIGIBLE",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  NEEDS_MANUAL_REVIEW: {
    label: "NEEDS REVIEW",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export function VerdictSidePanel({
  result,
  criterion,
  bidderName,
  onClose,
  onApprove,
  onOverride,
}: VerdictSidePanelProps) {
  const style = VERDICT_STYLE[result.verdict];

  return (
    <aside className="flex w-full flex-col overflow-y-auto border-l-2 border-brand bg-white lg:w-80">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-bold text-gray-950">Verdict Detail</h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close verdict detail"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div className={`rounded-md border p-3 ${style.className}`}>
          <p className="text-sm font-bold">{style.label}</p>
          <p className="mt-0.5 text-xs opacity-80">{bidderName}</p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Criterion</p>
          <p className="text-sm leading-5 text-gray-700">{criterion?.description ?? "-"}</p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Evidence</p>
          {result.evidence_ref ? (
            <>
              <p className="text-sm font-semibold text-gray-950">{result.evidence_ref.value}</p>
              <p className="text-xs text-gray-500">Page {result.evidence_ref.page}</p>
              {result.evidence_ref.translated_span ? (
                <p className="mt-1 text-xs text-purple-700">
                  Translation: {result.evidence_ref.translated_span}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-gray-500">No evidence reference available.</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase text-gray-400">Confidence</p>
          <ConfidenceBar label="OCR Confidence" value={result.ocr_confidence} />
          <ConfidenceBar label="Extraction Confidence" value={result.extraction_confidence} />
          <ConfidenceBar label="Span Validated" value={null} pass={result.span_validated} />
        </div>

        {result.evidence_ref?.raw_span ? (
          <div className="rounded border border-gray-200 border-l-brand bg-gray-50 p-3 text-xs italic leading-5 text-gray-600">
            &quot;{result.evidence_ref.raw_span}&quot;
          </div>
        ) : null}

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Reason</p>
          <p className="text-xs leading-5 text-gray-600">{result.reason}</p>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
          Model {result.model_version}
          <br />
          Replay ID {result.replay_id}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t px-4 py-3">
        <button
          onClick={onApprove}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve verdict
        </button>
        <button
          onClick={() => {
            const reason = window.prompt("Reason for override");
            if (reason) onOverride(reason);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand py-2 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Override verdict
        </button>
      </div>
    </aside>
  );
}
