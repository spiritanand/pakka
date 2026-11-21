import { db, type EventRow, type Vouch } from "./db";

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const panOk = (pan?: string | null) => !!pan && PAN_RE.test(pan.toUpperCase());

export function gstinOk(gstin?: string | null) {
  if (!gstin) return false;
  const g = gstin.toUpperCase();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = GSTIN_CHARS.indexOf(g[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(v / 36) + (v % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36] === g[14];
}

export const BANDS = [
  { min: 800, name: "Trusted", color: "emerald" },
  { min: 600, name: "Reliable", color: "lime" },
  { min: 300, name: "Building", color: "amber" },
  { min: 0, name: "New", color: "zinc" },
] as const;

export const bandOf = (score: number) => BANDS.find((b) => score >= b.min)!;

type Inputs = { pan: string | null; gstin: string | null };

function baseOf(userId: string, u: Inputs) {
  const events = db.prepare(`select * from events where user_id = ?`).all(userId) as EventRow[];
  const id = 50 + (panOk(u.pan) ? 60 : 0) + (gstinOk(u.gstin) ? 40 : 0);

  const goods = events.filter((e) => e.type === "DELIVERED" || e.type === "ACCEPTED");
  const perCounterparty = new Map<string, number>();
  let m = 0;
  let v = 0;
  for (const e of goods) {
    const k = e.counterparty_id ?? "?";
    const c = perCounterparty.get(k) ?? 0;
    if (c >= 3) continue;
    perCounterparty.set(k, c + 1);
    m += 1;
    v += e.amount / 100;
  }
  const track = 200 * Math.min(1, m / 10) + Math.min(150, 50 * Math.log10(1 + v / 1000));

  const ghosts = events.filter((e) => e.type === "GHOSTED").length;
  const silent = events.filter((e) => e.type === "AUTO_RELEASED").length;
  const outcomes = goods.length + ghosts + silent;
  const rel = (250 * goods.length) / (outcomes + 3);
  const pen = 300 * ghosts + 40 * silent;

  const myVouchees = db.prepare(`select * from vouches where voucher_id = ?`).all(userId) as Vouch[];
  let cascadeHits = 0;
  for (const vo of myVouchees) {
    const row = db
      .prepare(`select count(*) n from events where user_id = ? and type = 'GHOSTED' and created_at >= ?`)
      .get(vo.vouchee_id, vo.created_at) as { n: number };
    cascadeHits += row.n;
  }
  const casc = 150 * cascadeHits;

  return {
    base: id + track + rel - pen - casc,
    parts: { identity: id, track: Math.round(track), reliability: Math.round(rel), penalties: -pen, cascade: -casc },
    stats: { delivered: goods.length, ghosted: ghosts, silentReviews: silent, rupees: Math.round(v), cascadeHits },
  };
}

function inputsOf(userId: string) {
  return (db.prepare(`select pan, gstin from user where id = ?`).get(userId) as Inputs | undefined) ?? { pan: null, gstin: null };
}

export function trustScore(userId: string) {
  const b = baseOf(userId, inputsOf(userId));
  const vouchers = db
    .prepare(
      `select v.*, u.name voucher_name from vouches v join user u on u.id = v.voucher_id where v.vouchee_id = ? order by v.created_at desc`,
    )
    .all(userId) as (Vouch & { voucher_name: string })[];
  const weighted = vouchers
    .map((v) => {
      const vb = Math.max(0, baseOf(v.voucher_id, inputsOf(v.voucher_id)).base);
      return { ...v, voucher_score: Math.round(clamp(vb)), weight: Math.round(0.1 * vb) };
    })
    .sort((a, c) => c.weight - a.weight);
  const vouch = Math.min(200, weighted.slice(0, 3).reduce((s, v) => s + v.weight, 0));
  const score = Math.round(clamp(b.base + vouch));
  return {
    score,
    band: bandOf(score).name,
    parts: { ...b.parts, vouches: vouch },
    stats: b.stats,
    vouchers: weighted.map(({ voucher_id, voucher_name, voucher_score, weight, note, created_at }) => ({
      voucher_id, voucher_name, voucher_score, weight, note, created_at,
    })),
  };
}

const clamp = (n: number) => Math.max(0, Math.min(1000, n));
