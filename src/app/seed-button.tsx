"use client";

import { useState } from "react";

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="text-[13px] text-faint underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong disabled:opacity-50"
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
