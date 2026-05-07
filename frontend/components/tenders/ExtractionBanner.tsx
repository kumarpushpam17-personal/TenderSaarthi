"use client";

import { useEffect, useState } from "react";

export function ExtractionBanner() {
  const [progress, setProgress] = useState(24);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? 92 : current + 14));
    }, 700);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-950">
          Extracting criteria from PDF
        </p>
        <p className="mt-0.5 text-xs text-blue-700">
          Claude Sonnet is reading the tender. This usually takes 15 to 30 seconds.
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-blue-200">
          <div
            className="h-1.5 rounded-full bg-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
