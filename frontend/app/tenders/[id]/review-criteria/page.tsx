"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CriteriaTable } from "@/components/criteria/CriteriaTable";
import { approveCriteria, fetchCriteria } from "@/lib/api";
import type { Criterion } from "@/lib/types";

export default function ReviewCriteriaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchCriteria(params.id)
      .then(setCriteria)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleApprove() {
    setApproving(true);
    try {
      await approveCriteria(params.id);
      router.push(`/tenders/${params.id}/bidders`);
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return <main className="px-6 py-8 text-sm text-gray-500">Loading criteria</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <CriteriaTable
        initialCriteria={criteria}
        tenderId={params.id}
        onApprove={handleApprove}
        approving={approving}
      />
    </main>
  );
}
