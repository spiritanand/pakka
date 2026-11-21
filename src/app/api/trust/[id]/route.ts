import { NextResponse } from "next/server";
import { db, type EventRow } from "@/lib/db";
import { ensureMigrated } from "@/lib/auth";
import { trustScore } from "@/lib/score";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await ensureMigrated();
  const { id } = await ctx.params;
  const key = decodeURIComponent(id);
  const u = db
    .prepare(`select id, name, pan from user where id = ? or upper(pan) = upper(?) or lower(email) = lower(?) or phone = ?`)
    .get(key, key, key, key) as { id: string; name: string; pan: string | null } | undefined;
  if (!u) return NextResponse.json({ error: "unknown subject", status: "unknown" }, { status: 404 });
  const t = trustScore(u.id);
  const recent = db
    .prepare(`select type, amount, created_at from events where user_id = ? and type != 'FUNDED' order by created_at desc limit 10`)
    .all(u.id) as Pick<EventRow, "type" | "amount" | "created_at">[];
  return NextResponse.json({
    subject: { id: u.id, name: u.name, pan: u.pan ? `${u.pan.slice(0, 3)}XXXX${u.pan.slice(-3)}` : null },
    score: t.score,
    band: t.band,
    breakdown: t.parts,
    stats: t.stats,
    vouched_by: t.vouchers.map((v) => ({ name: v.voucher_name, score: v.voucher_score, weight: v.weight })),
    recent_outcomes: recent.map((r) => ({ type: r.type, rupees: r.amount / 100, at: new Date(r.created_at).toISOString() })),
  });
}
