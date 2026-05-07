import { Play } from "lucide-react";
import Link from "next/link";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { fetchTenderSubmissions } from "@/lib/api";

export default async function AdminSubmissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const submissions = await fetchTenderSubmissions(params.id);
  const readyCount = submissions.filter(
    (submission) => submission.status === "READY_FOR_EVALUATION"
  ).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-950">
            Bidder Submissions ({submissions.length})
          </h1>
          <p className="text-xs text-gray-500">
            Review documents uploaded by bidders before running eligibility evaluation.
          </p>
        </div>
        <Link
          href={`/tenders/${params.id}/verdicts`}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-bg"
        >
          <Play className="h-4 w-4" />
          Evaluate Ready ({readyCount})
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">{submissions.length}</p>
          <p className="mt-1 text-xs text-gray-500">Received</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">{readyCount}</p>
          <p className="mt-1 text-xs text-gray-500">Ready</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card">
          <p className="text-2xl font-extrabold text-brand">
            {submissions.reduce((total, item) => total + item.document_count, 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Documents</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>
    </main>
  );
}
