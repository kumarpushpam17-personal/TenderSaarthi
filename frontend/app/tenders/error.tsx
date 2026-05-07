"use client";

export default function TendersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-center">
      <p className="mb-3 text-3xl">⚠️</p>
      <h1 className="mb-2 text-lg font-bold text-gray-950">
        Could not load tenders
      </h1>
      <p className="mb-1 text-sm text-gray-500">
        The backend may be waking up (free tier cold start). Wait 30 s and
        click Try again.
      </p>
      <p className="mb-6 font-mono text-xs text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </main>
  );
}
