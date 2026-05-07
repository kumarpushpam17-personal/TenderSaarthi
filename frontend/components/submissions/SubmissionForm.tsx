"use client";

import { FileUp, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSubmission, uploadSubmissionDocument } from "@/lib/api";

export function SubmissionForm({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [legalName, setLegalName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const submission = await createSubmission(tenderId, {
        legal_name: legalName,
        contact_email: contactEmail,
        gst_number: gstNumber || undefined,
      });

      await Promise.all(files.map((file) => uploadSubmissionDocument(submission.id, file)));
      router.push(`/bidder/submissions/${submission.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Legal Name
          </label>
          <input
            required
            value={legalName}
            onChange={(event) => setLegalName(event.target.value)}
            placeholder="Demo Infrastructure LLP"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Contact Email
          </label>
          <input
            required
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="compliance@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            GST Number
          </label>
          <input
            value={gstNumber}
            onChange={(event) => setGstNumber(event.target.value)}
            placeholder="29ABCDE1234F1Z5"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          Bid Documents
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-8 text-center text-sm text-blue-900">
          <FileUp className="mb-2 h-6 w-6" />
          <span>
            {files.length ? `${files.length} files selected` : "Select PDFs, scans, photos, or DOCX files"}
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            className="hidden"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
      </div>

      {files.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="max-w-full truncate rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
              title={file.name}
            >
              {file.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          disabled={submitting || !legalName || !contactEmail}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit Bid
        </button>
      </div>
    </form>
  );
}
