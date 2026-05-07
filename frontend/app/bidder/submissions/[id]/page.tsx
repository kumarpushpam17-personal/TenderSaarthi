import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { fetchSubmission } from "@/lib/api";

export default async function BidderSubmissionStatusPage({
  params,
}: {
  params: { id: string };
}) {
  const submission = await fetchSubmission(params.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-brand">Submission Status</p>
        <h1 className="mt-1 text-xl font-bold text-gray-950">{submission.legal_name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track OCR, document matching, and any corrections needed before evaluation.
        </p>
      </div>
      <SubmissionCard submission={submission} />
      <div className="mt-6">
        <Link
          href="/bidder/tenders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          Back to open tenders
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </main>
  );
}
