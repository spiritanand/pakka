import Link from "next/link";
import { trustScore } from "@/lib/score";
import { SpringNumber } from "@/components/motion";
import { firstName } from "./format";

const TONE: Record<string, string> = {
  Trusted: "chip-emerald",
  Reliable: "chip border-lime-200 bg-lime-50 text-lime-800",
  Building: "chip-amber",
  New: "chip-zinc",
};

export function StableNumber({ from, to, className = "", duration = 0.6 }: { from: number; to: number; className?: string; duration?: number }) {
  const widest = String(from).length > String(to).length ? from : to;
  return (
    <span className={`relative inline-block tabular-nums ${className}`}>
      <span aria-hidden className="invisible">{widest}</span>
      <SpringNumber from={from} to={to} duration={duration} className="absolute inset-0 text-right" />
    </span>
  );
}

export function ScoreChip({ userId, name, role, size = "md" }: { userId: string; name: string; role?: string; size?: "md" | "lg" }) {
  const t = trustScore(userId);
  const lg = size === "lg";
  return (
    <Link href={`/u/${userId}`} prefetch={true} className="group inline-flex items-center gap-5 rounded-md">
      <span className="flex items-baseline gap-1">
        <span className={`font-semibold tracking-[-0.04em] text-ink tabular-nums ${lg ? "text-6xl sm:text-7xl" : "text-5xl"}`}>
          {lg ? <StableNumber from={Math.max(0, t.score - 40)} to={t.score} /> : t.score}
        </span>
        <span className="text-xs text-faint tabular-nums">/1000</span>
      </span>
      <span className="flex min-w-0 flex-col gap-1.5 leading-tight">
        <span className="flex items-center gap-2 text-[13px] text-muted">
          {role ?? "Pakka score"}
          <span className={TONE[t.band]}><span className="dot" />{t.band}</span>
        </span>
        <span className={`font-semibold text-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-emerald-600 ${lg ? "text-xl" : "text-base"}`}>
          {firstName(name)}
        </span>
        <span className="text-xs text-muted tabular-nums">
          {t.stats.delivered} done · {t.stats.ghosted} ghosted · {t.vouchers.length} vouch{t.vouchers.length === 1 ? "" : "es"}
        </span>
      </span>
    </Link>
  );
}
