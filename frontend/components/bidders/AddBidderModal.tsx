"use client";

import { Upload, X } from "lucide-react";
import { useState } from "react";

interface AddBidderModalProps {
  onAdd: (name: string, files: File[]) => void;
  onClose: () => void;
}

export function AddBidderModal({ onAdd, onClose }: AddBidderModalProps) {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-950">Add Bidder</h2>
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
              Legal Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sharma Constructions Pvt. Ltd."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Documents
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-center text-sm text-blue-900">
              <Upload className="mb-2 h-5 w-5" />
              <span>{files.length ? `${files.length} files selected` : "Select PDFs or images"}</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="hidden"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={!name}
            onClick={() => {
              onAdd(name, files);
              onClose();
            }}
            className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Add Bidder
          </button>
        </div>
      </div>
    </div>
  );
}
