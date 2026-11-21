import Link from "next/link";
import type { ReactNode } from "react";
import { trustScore } from "@/lib/score";
import { SpringNumber } from "@/components/motion";
import { firstName } from "./format";

const TONE: Record<string, string> = {
  Trusted: "chip-emerald",
  Reliable: "chip-emerald",
  Building: "chip-amber",
  New: "chip-zinc",
};

export const profileHref = (userId: string, from?: string) => `/u/${userId}${from ? `?from=${encodeURIComponent(from)}` : ""}`;

export function StableNumber({ from, to, className = "", duration = 0.6, force = false }: { from: number; to: number; className?: string; duration?: number; force?: boolean }) {
  const widest = String(from).length > String(to).length ? from : to;
  return (
    <span className={`relative inline-block tabular-nums ${className}`}>
      <span className="sr-only">{to}</span>
      <span aria-hidden className="invisible">{widest}</span>
      <span aria-hidden>
        <SpringNumber from={from} to={to} duration={duration} force={force} className="absolute inset-0 text-right" />
      </span>
    </span>
  );
}

export function ScoreChip({ userId, name, role, size = "md", link = true, badges, from }: {
  userId: string; name: string; role?: string; size?: "md" | "lg"; link?: boolean; badges?: ReactNode; from?: string;
}) {
  const t = trustScore(userId);
  const lg = size === "lg";
  const Name = lg ? "h1" : "span";
  const body = (
    <>
      <span className="flex items-baseline gap-1">
        <span className={`font-semibold tracking-[-0.03em] text-ink tabular-nums ${lg ? "text-6xl sm:text-7xl" : "text-5xl"}`}>{t.score}</span>
        <span className="text-meta text-muted tabular-nums">/1000</span>
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-2 text-meta text-muted">
          {role ?? "Pakka score"}
          <span className={TONE[t.band]}><span className="dot" />{t.band}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Name className={`text-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-emerald-600 ${lg ? "text-heading" : "text-base leading-tight font-medium"}`}>
            {firstName(name)}
          </Name>
          {badges}
        </span>
        <span className="text-meta text-muted tabular-nums">
          {t.stats.delivered} done · {t.stats.ghosted} ghosted · {t.vouchers.length} vouch{t.vouchers.length === 1 ? "" : "es"}
        </span>
      </span>
    </>
  );
  const cls = "group inline-flex items-center gap-5 rounded-md";
  return link ? <Link href={profileHref(userId, from)} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
