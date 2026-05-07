import { VerdictMatrix } from "@/components/verdicts/VerdictMatrix";
import { fetchCriteria, fetchVerdicts } from "@/lib/api";

export default async function VerdictsPage({ params }: { params: { id: string } }) {
  const [criteria, matrix] = await Promise.all([
    fetchCriteria(params.id),
    fetchVerdicts(params.id),
  ]);

  return <VerdictMatrix criteria={criteria} matrix={matrix} />;
}
