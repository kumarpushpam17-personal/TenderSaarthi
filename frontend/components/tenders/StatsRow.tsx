import type { TenderStats } from "@/lib/types";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 text-center shadow-card ${color}`}
    >
      <div className="text-2xl font-extrabold text-gray-950">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: TenderStats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active Tenders" value={stats.active} color="border-t-4 border-t-brand" />
      <StatCard
        label="Awaiting Review"
        value={stats.awaiting_review}
        color="border-t-4 border-t-amber-400"
      />
      <StatCard
        label="Verdicts Generated"
        value={stats.verdicts_total}
        color="border-t-4 border-t-green-500"
      />
      <StatCard label="Signed Reports" value={stats.signed} color="border-t-4 border-t-indigo-500" />
    </div>
  );
}
