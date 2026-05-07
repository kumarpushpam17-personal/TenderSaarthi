"use client";

import { CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TenderStatus } from "@/lib/types";

const TABS = [
  { label: "Overview", path: "" },
  { label: "Review Criteria", path: "/review-criteria" },
  { label: "Bidders", path: "/bidders" },
  { label: "Evaluate", path: "/verdicts" },
  { label: "Report", path: "/audit" },
] as const;

const COMPLETED_UP_TO: Record<TenderStatus, number> = {
  UPLOADED: -1,
  EXTRACTING: -1,
  AWAITING_REVIEW: 0,
  CRITERIA_APPROVED: 1,
  EVALUATING: 2,
  EVALUATED: 3,
  SIGNED: 4,
};

function isTabCompleted(tabPath: string, status: TenderStatus): boolean {
  const order: string[] = TABS.map((tab) => tab.path);
  return order.indexOf(tabPath) <= COMPLETED_UP_TO[status];
}

function isTabLocked(tabPath: string, status: TenderStatus): boolean {
  if (
    tabPath === "/bidders" &&
    !["CRITERIA_APPROVED", "EVALUATING", "EVALUATED", "SIGNED"].includes(status)
  ) {
    return true;
  }
  if (
    tabPath === "/verdicts" &&
    !["EVALUATING", "EVALUATED", "SIGNED"].includes(status)
  ) {
    return true;
  }
  if (tabPath === "/audit" && !["EVALUATED", "SIGNED"].includes(status)) {
    return true;
  }
  return false;
}

interface TenderTabsProps {
  tenderId: string;
  status: TenderStatus;
}

export function TenderTabs({ tenderId, status }: TenderTabsProps) {
  const pathname = usePathname();
  const base = `/tenders/${tenderId}`;

  return (
    <div className="flex overflow-x-auto border-b border-brand-border bg-brand-bg px-6">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}`;
        const isActive = pathname === href || (tab.path === "" && pathname === base);
        const completed = isTabCompleted(tab.path, status);
        const locked = isTabLocked(tab.path, status);
        const label = (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            {completed && !isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {locked ? <Lock className="h-3.5 w-3.5" /> : null}
            {tab.label}
          </span>
        );

        if (locked) {
          return (
            <span
              key={tab.path}
              className="select-none border-r border-brand-border px-4 py-3 text-xs text-gray-400"
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={tab.path}
            href={href}
            className={`border-r border-brand-border px-4 py-3 text-xs transition-colors ${
              isActive
                ? "-mb-px border-b-2 border-brand bg-white font-bold text-brand"
                : completed
                  ? "text-green-600 hover:text-brand"
                  : "text-gray-600 hover:text-brand"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
