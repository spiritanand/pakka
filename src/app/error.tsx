"use client";

import Link from "next/link";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const detail = process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : null;
  return (
    <div className="max-w-md py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-ink-2">{detail ?? "Try again, or head back to your dashboard."}</p>
      <div className="mt-6 flex gap-3">
        <button className="btn" onClick={() => retry()}>Try again</button>
        <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
      </div>
    </div>
  );
}
