"use client";

import { useState } from "react";

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  if (process.env.NODE_ENV === "production") return null;
  return (
    <button
      className="text-[13px] text-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong disabled:opacity-50"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/dev/seed", { method: "POST", headers: { "x-seed": "1" } });
        window.location.href = "/login";
      }}
    >
      {busy ? "Resetting…" : "Reset demo data"}
    </button>
  );
}
