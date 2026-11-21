import Link from "next/link";
import { trustScore } from "@/lib/score";

const TONE: Record<string, string> = {
  Trusted: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Reliable: "bg-lime-100 text-lime-800 border-lime-300",
  Building: "bg-amber-100 text-amber-800 border-amber-300",
  New: "bg-zinc-100 text-zinc-700 border-zinc-300",
};

export function ScoreChip({ userId, name, role }: { userId: string; name: string; role?: string }) {
  const t = trustScore(userId);
  return (
    <Link href={`/u/${userId}`} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${TONE[t.band]}`}>
      <div className="text-3xl font-bold tabular-nums">{t.score}</div>
      <div className="leading-tight">
        <div className="text-xs uppercase tracking-wide opacity-70">{role ?? "Pakka score"} · {t.band}</div>
        <div className="font-medium">{name}</div>
        <div className="text-xs opacity-70">
          {t.stats.delivered} done · {t.stats.ghosted} ghosted · {t.vouchers.length} vouch{t.vouchers.length === 1 ? "" : "es"}
        </div>
      </div>
    </Link>
  );
}
