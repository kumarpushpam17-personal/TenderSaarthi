"use client";

import { Edit2, Trash2 } from "lucide-react";
import type { Criterion } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  FINANCIAL: "bg-blue-100 text-blue-800",
  TECHNICAL: "bg-green-100 text-green-800",
  COMPLIANCE: "bg-purple-100 text-purple-800",
  DOCUMENT: "bg-orange-100 text-orange-800",
  CERTIFICATION: "bg-amber-100 text-amber-800",
};

function thresholdLabel(criterion: Criterion) {
  if (!criterion.threshold) return "-";
  if (criterion.threshold.type === "min_amount_inr") {
    return `>= INR ${(Number(criterion.threshold.value) / 10000000).toFixed(1)} Cr`;
  }
  if (criterion.threshold.type === "min_count") {
    return `>= ${criterion.threshold.value}`;
  }
  return "Must exist";
}

interface CriterionRowProps {
  criterion: Criterion;
  onEdit: () => void;
  onDelete: () => void;
}

export function CriterionRow({ criterion, onEdit, onDelete }: CriterionRowProps) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 align-top text-xs">
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[criterion.category]}`}
        >
          {criterion.category}
        </span>
      </td>
      <td className="max-w-xl px-4 py-3 text-sm leading-5 text-gray-700">
        {criterion.description}
        <p className="mt-1 text-xs text-gray-400">Source page {criterion.source_page}</p>
      </td>
      <td className="px-4 py-3 align-top text-xs text-gray-600">
        {thresholdLabel(criterion)}
      </td>
      <td className="px-4 py-3 align-top text-xs">
        <span
          className={`rounded px-2 py-0.5 font-semibold ${
            criterion.is_mandatory
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {criterion.is_mandatory ? "YES" : "OPTIONAL"}
        </span>
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex gap-1.5">
          <button
            onClick={onEdit}
            className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-brand"
            aria-label="Edit criterion"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete criterion"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
