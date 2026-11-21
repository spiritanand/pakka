"use client";

import { useState } from "react";

export function CopyLink() {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setDone(true);
      }}
    >
      {done ? "Copied. Paste it in WhatsApp." : "Copy Pakka link"}
    </button>
  );
}
