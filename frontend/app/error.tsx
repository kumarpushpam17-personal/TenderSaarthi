"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="text-lg font-bold text-gray-950">Something went wrong</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Could not load data from the backend. If this is a demo deployment, the
        backend may be waking up — please wait 30 seconds and try again.
      </p>
      <p className="font-mono text-xs text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </main>
  );
}
