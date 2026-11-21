"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MarkdownLink() {
  if (usePathname() !== "/") return null;
  return (
    <Link href="/machine" className="text-[13px] text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink">
      For AI agents
    </Link>
  );
}
