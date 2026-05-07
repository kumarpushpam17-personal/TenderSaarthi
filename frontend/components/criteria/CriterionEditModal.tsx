"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { Criterion, CriterionCategory } from "@/lib/types";

const CATEGORIES: CriterionCategory[] = [
  "FINANCIAL",
  "TECHNICAL",
  "COMPLIANCE",
  "DOCUMENT",
  "CERTIFICATION",
];

interface CriterionEditModalProps {
  criterion: Criterion;
  onSave: (updates: Partial<Criterion>) => void;
  onClose: () => void;
}

export function CriterionEditModal({
  criterion,
  onSave,
  onClose,
}: CriterionEditModalProps) {
  const [description, setDescription] = useState(criterion.description);
  const [category, setCategory] = useState<CriterionCategory>(criterion.category);
  const [mandatory, setMandatory] = useState(criterion.is_mandatory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-950">Edit Criterion</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CriterionCategory)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={mandatory}
              onChange={(event) => setMandatory(event.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Mandatory criterion
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ description, category, is_mandatory: mandatory });
              onClose();
            }}
            className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
