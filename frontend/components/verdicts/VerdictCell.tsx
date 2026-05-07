import { AlertTriangle, Check, X } from "lucide-react";
import type { VerdictValue } from "@/lib/types";

const STYLES: Record<VerdictValue, string> = {
  ELIGIBLE: "bg-green-100 text-green-700 hover:bg-green-200",
  NOT_ELIGIBLE: "bg-red-100 text-red-700 hover:bg-red-200",
  NEEDS_MANUAL_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-200",
};

interface VerdictCellProps {
  verdict: VerdictValue;
  onClick: () => void;
  selected: boolean;
}

export function VerdictCell({ verdict, onClick, selected }: VerdictCellProps) {
  const icon =
    verdict === "ELIGIBLE" ? (
      <Check className="mx-auto h-4 w-4" />
    ) : verdict === "NOT_ELIGIBLE" ? (
      <X className="mx-auto h-4 w-4" />
    ) : (
      <AlertTriangle className="mx-auto h-4 w-4" />
    );

  return (
    <td
      onClick={onClick}
      className={`cursor-pointer border border-gray-100 px-3 py-2.5 text-center transition-colors ${STYLES[verdict]} ${
        selected ? "ring-2 ring-inset ring-brand" : ""
      }`}
    >
      {icon}
    </td>
  );
}
