import { db, type EventRow } from "./db";
import { trustScore } from "./score";

export function trustReport(key: string, recentLimit = 10) {
  const u = db
    .prepare(`select id, name, pan from user where id = ? or (length(?) = 10 and upper(pan) = upper(?))`)
    .get(key, key, key) as { id: string; name: string; pan: string | null } | undefined;
  if (!u) return null;
  const t = trustScore(u.id);
  const recent = db
    .prepare(`select type, amount, created_at from events where user_id = ? and type != 'FUNDED' order by created_at desc limit ?`)
    .all(u.id, recentLimit) as Pick<EventRow, "type" | "amount" | "created_at">[];
  return {
    subject: { id: u.id, name: u.name, pan: u.pan ? `${u.pan.slice(0, 3)}XXXX${u.pan.slice(-3)}` : null },
    score: t.score,
    band: t.band,
    breakdown: t.parts,
    stats: t.stats,
    vouched_by: t.vouchers.map((v) => ({ name: v.voucher_name, score: v.voucher_score, weight: v.weight })),
    recent_outcomes: recent.map((r) => ({ type: r.type, rupees: r.amount / 100, at: new Date(r.created_at).toISOString() })),
  };
}
