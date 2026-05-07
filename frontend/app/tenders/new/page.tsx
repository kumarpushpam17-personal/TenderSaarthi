"use client";

import { ArrowLeft, FileUp, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createTender } from "@/lib/api";

export default function NewTenderPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title || !file) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("procuring_department", department);
      form.append("file", file);
      const tender = await createTender(form);
      router.push(`/tenders/${tender.id}?extracting=1`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Link
        href="/tenders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenders
      </Link>
      <h1 className="text-xl font-bold text-gray-950">Upload New Tender</h1>
      <p className="mb-8 mt-1 text-sm text-gray-500">
        Criteria will be automatically extracted after upload.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tender Name
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="CRPF Construction Tender 2024"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Procuring Department
          </label>
          <input
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="CRPF - HQ New Delhi"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tender PDF
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              setFile(event.dataTransfer.files[0] ?? null);
            }}
            className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-brand bg-brand-bg"
                : "border-blue-300 bg-white hover:border-brand"
            }`}
          >
            <FileUp className="mb-2 h-8 w-8 text-brand" />
            <span className="text-sm font-medium text-gray-800">
              {file ? file.name : "Drop PDF here or click to browse"}
            </span>
            <span className="mt-1 text-xs text-gray-400">PDF only, max 50 MB</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title || !file}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {loading ? "Uploading" : "Upload and Extract Criteria"}
        </button>
      </form>
    </main>
  );
}
