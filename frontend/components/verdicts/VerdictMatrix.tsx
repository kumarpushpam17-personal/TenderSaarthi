"use client";

import { useMemo, useState } from "react";
import { approveVerdict, overrideVerdict } from "@/lib/api";
import type {
  BidderVerdicts,
  Criterion,
  VerdictMatrix as VerdictMatrixType,
  VerdictResult,
} from "@/lib/types";
import { VerdictCell } from "./VerdictCell";
import { VerdictSidePanel } from "./VerdictSidePanel";

interface VerdictMatrixProps {
  matrix: VerdictMatrixType;
  criteria: Criterion[];
}

interface SelectedCell {
  bidderIndex: number;
  criterionId: string;
}

const SHORT_LABELS: Record<string, string> = {
  "c-001": "Turnover",
  "c-002": "Projects",
  "c-003": "ISO 9001",
  "c-004": "GST",
  "c-005": "PAN",
  "c-006": "Blacklist",
  "c-007": "Single Work",
  "c-008": "Net Worth",
  "c-009": "OHSAS",
};

function shortLabel(criterion: Criterion | undefined, criterionId: string) {
  if (!criterion) return criterionId;
  return SHORT_LABELS[criterion.id] ?? criterion.category;
}

function verdictApiId(bidderVerdicts: BidderVerdicts, result: VerdictResult) {
  return `${bidderVerdicts.bidder_id}-${result.criterion_id}`;
}

export function VerdictMatrix({ matrix, criteria }: VerdictMatrixProps) {
  const [selected, setSelected] = useState<SelectedCell | null>({
    bidderIndex: 1,
    criterionId: "c-001",
  });
  const [localVerdicts, setLocalVerdicts] = useState(matrix.verdicts);
  const criteriaMap = useMemo(
    () => Object.fromEntries(criteria.map((criterion) => [criterion.id, criterion])),
    [criteria]
  );

  const selectedBidder = selected ? localVerdicts[selected.bidderIndex] : undefined;
  const selectedResult =
    selectedBidder && selected
      ? selectedBidder.results.find((result) => result.criterion_id === selected.criterionId)
      : undefined;

  function updateSelected(updates: Partial<VerdictResult>) {
    if (!selected) return;
    setLocalVerdicts((current) =>
      current.map((bidderVerdicts, bidderIndex) =>
        bidderIndex === selected.bidderIndex
          ? {
              ...bidderVerdicts,
              results: bidderVerdicts.results.map((result) =>
                result.criterion_id === selected.criterionId
                  ? { ...result, ...updates }
                  : result
              ),
            }
          : bidderVerdicts
      )
    );
  }

  async function handleApprove() {
    if (!selectedBidder || !selectedResult) return;
    updateSelected({ reviewer_action: "APPROVED" });
    await approveVerdict(verdictApiId(selectedBidder, selectedResult));
  }

  async function handleOverride(reason: string) {
    if (!selectedBidder || !selectedResult) return;
    updateSelected({ reviewer_action: "OVERRIDDEN", reviewer_reason: reason });
    await overrideVerdict(verdictApiId(selectedBidder, selectedResult), reason);
  }

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col lg:flex-row">
      <section className="flex-1 overflow-auto px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-950">Verdict Matrix</h1>
            <p className="text-xs text-gray-500">
              Bidders down the table, reviewed criteria across the table.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">ELIGIBLE</span>
            <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">NOT ELIGIBLE</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700">REVIEW</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-card">
          <table className="border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="min-w-52 border border-gray-200 px-4 py-2 text-left text-xs font-bold uppercase text-gray-500">
                  Bidder
                </th>
                {matrix.criteria.map((criterionId) => (
                  <th
                    key={criterionId}
                    className="min-w-24 border border-gray-200 px-3 py-2 text-center text-xs font-bold uppercase text-gray-500"
                  >
                    {shortLabel(criteriaMap[criterionId], criterionId)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localVerdicts.map((bidderVerdicts, bidderIndex) => (
                <tr key={bidderVerdicts.bidder_id}>
                  <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-950">
                    {bidderVerdicts.bidder_name}
                  </td>
                  {matrix.criteria.map((criterionId) => {
                    const result = bidderVerdicts.results.find(
                      (item) => item.criterion_id === criterionId
                    );
                    if (!result) {
                      return (
                        <td key={criterionId} className="border border-gray-100 px-3 py-2">
                          -
                        </td>
                      );
                    }
                    return (
                      <VerdictCell
                        key={criterionId}
                        verdict={result.verdict}
                        selected={
                          selected?.bidderIndex === bidderIndex &&
                          selected.criterionId === criterionId
                        }
                        onClick={() => setSelected({ bidderIndex, criterionId })}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedResult && selectedBidder ? (
        <VerdictSidePanel
          result={selectedResult}
          criterion={criteriaMap[selectedResult.criterion_id]}
          bidderName={selectedBidder.bidder_name}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onOverride={handleOverride}
        />
      ) : null}
    </div>
  );
}
