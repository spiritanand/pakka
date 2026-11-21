"use client";

import { useState } from "react";

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-ghost text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/dev/seed", { method: "POST" });
        window.location.href = "/";
      }}
    >
      {busy ? "Resetting…" : "Reset demo data"}
    </button>
  );
}
