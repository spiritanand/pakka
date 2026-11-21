"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MarkdownLink() {
  if (usePathname() === "/machine") return null;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-muted">
      <Link href="/machine" className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink">
        For AI agents
      </Link>
      <code className="hidden font-mono text-xs sm:inline">curl -H &quot;Accept: text/markdown&quot; pakka.zwala.dev</code>
    </span>
  );
}
