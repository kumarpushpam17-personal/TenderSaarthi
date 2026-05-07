"use client";

import { Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddBidderModal } from "@/components/bidders/AddBidderModal";
import { BidderCard } from "@/components/bidders/BidderCard";
import { createBidder, fetchBidders, triggerEvaluation } from "@/lib/api";
import type { Bidder } from "@/lib/types";

export default function BiddersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchBidders(params.id)
      .then(setBidders)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleAdd(name: string) {
    const created = await createBidder(params.id, name);
    setBidders((current) => [created, ...current]);
  }

  async function handleEvaluate() {
    setEvaluating(true);
    try {
      await triggerEvaluation(params.id);
      router.push(`/tenders/${params.id}/verdicts`);
    } finally {
      setEvaluating(false);
    }
  }

  if (loading) {
    return <main className="px-6 py-8 text-sm text-gray-500">Loading bidders</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-950">Bidders ({bidders.length})</h1>
          <p className="text-xs text-gray-500">
            Document language and type are visible for every submitted file.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Add Bidder
          </button>
          <button
            onClick={handleEvaluate}
            disabled={evaluating || bidders.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-bg disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {evaluating ? "Starting" : "Evaluate"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {bidders.map((bidder) => (
          <BidderCard key={bidder.id} bidder={bidder} />
        ))}
      </div>

      {showModal ? (
        <AddBidderModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      ) : null}
    </main>
  );
}
