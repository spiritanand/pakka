"use client";

import { useState } from "react";

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-line-strong px-3 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/dev/seed", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      {busy ? "Resetting…" : "Reset demo data"}
    </button>
  );
}
