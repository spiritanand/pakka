"use client";

import { useState } from "react";

export function CopyMarkdown({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
      onClick={async () => {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied" : "Copy markdown"}
    </button>
  );
}
