"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { updateCriterion } from "@/lib/api";
import type { Criterion } from "@/lib/types";
import { CriterionEditModal } from "./CriterionEditModal";
import { CriterionRow } from "./CriterionRow";

interface CriteriaTableProps {
  initialCriteria: Criterion[];
  tenderId: string;
  onApprove: () => void;
  approving: boolean;
}

export function CriteriaTable({
  initialCriteria,
  tenderId,
  onApprove,
  approving,
}: CriteriaTableProps) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [editing, setEditing] = useState<Criterion | null>(null);

  async function handleSave(id: string, updates: Partial<Criterion>) {
    setCriteria((current) =>
      current.map((criterion) =>
        criterion.id === id ? { ...criterion, ...updates } : criterion
      )
    );
    await updateCriterion(tenderId, id, updates);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-950">Review Extracted Criteria</h1>
          <p className="text-xs text-gray-500">
            {criteria.length} criteria. Approve, edit, or add before scoring begins.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-bg">
            <Plus className="h-3.5 w-3.5" />
            Add Criterion
          </button>
          <button
            onClick={onApprove}
            disabled={approving}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {approving ? "Approving" : "Approve All and Lock"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {["Category", "Description", "Threshold", "Mandatory", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-xs font-bold uppercase text-gray-500"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <CriterionRow
                  key={criterion.id}
                  criterion={criterion}
                  onEdit={() => setEditing(criterion)}
                  onDelete={() =>
                    setCriteria((current) =>
                      current.filter((item) => item.id !== criterion.id)
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <CriterionEditModal
          criterion={editing}
          onSave={(updates) => handleSave(editing.id, updates)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
