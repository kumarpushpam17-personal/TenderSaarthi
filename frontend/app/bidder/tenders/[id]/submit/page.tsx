import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import { fetchPublicTender } from "@/lib/api";

export default async function BidderSubmitPage({ params }: { params: { id: string } }) {
  const tender = await fetchPublicTender(params.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-brand">Bid Submission</p>
        <h1 className="mt-1 text-xl font-bold text-gray-950">{tender.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit firm details and upload documents for automated criteria matching.
        </p>
      </div>
      <SubmissionForm tenderId={params.id} />
    </main>
  );
}
