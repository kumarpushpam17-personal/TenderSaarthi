"use client";

import { FileText, ShieldCheck, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function navClass(active: boolean) {
  return active
    ? "text-white"
    : "text-brand-muted hover:text-white transition-colors";
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-6 bg-brand px-6 py-3 text-white shadow-md">
      <Link
        href="/tenders"
        className="flex items-center gap-2 text-base font-bold tracking-normal hover:text-brand-muted"
      >
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        TenderSaarthi
      </Link>
      <div className="flex-1" />
      <Link
        href="/tenders"
        className={`flex items-center gap-1.5 text-sm ${navClass(pathname.startsWith("/tenders"))}`}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        Tenders
      </Link>
      <span className="text-sm text-brand-muted">Reports</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light">
        <UserCircle className="h-5 w-5" aria-label="Admin" />
      </div>
    </nav>
  );
}
