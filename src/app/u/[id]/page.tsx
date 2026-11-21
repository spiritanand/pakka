import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow } from "@/lib/db";
import { panOk, gstinOk, trustScore } from "@/lib/score";
import { vouch } from "../../actions";
import { ScoreChip } from "../../score-chip";

const EVENT_TEXT: Record<string, string> = {
  DELIVERED: "Delivered & paid",
  ACCEPTED: "Released payment on time",
  AUTO_RELEASED: "Went silent in review (auto-released)",
  GHOSTED: "Ghosted — missed deadline, refunded",
  REFUNDED: "Got a refund",
};

export default async function Profile({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const u = getUser(id);
  if (!u) notFound();
  const me = await currentUser();
  const t = trustScore(u.id);
  const given = db
    .prepare(`select v.vouchee_id, u.name from vouches v join user u on u.id = v.vouchee_id where v.voucher_id = ?`)
    .all(u.id) as { vouchee_id: string; name: string }[];
  const events = db
    .prepare(`select * from events where user_id = ? and type != 'FUNDED' order by created_at desc limit 12`)
    .all(u.id) as EventRow[];
  const already = me ? t.vouchers.some((v) => v.voucher_id === me.id) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <ScoreChip userId={u.id} name={u.name} />
        <div className="text-sm text-black/60">
          PAN {panOk(u.pan) ? "✓ format-verified" : "—"} · GSTIN {gstinOk(u.gstin) ? "✓ checksum-verified" : "—"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <div className="label mb-3">How the score is built</div>
          {Object.entries(t.parts).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-black/5 py-1 text-sm">
              <span className="capitalize">{k}</span>
              <span className={`tabular-nums font-medium ${v < 0 ? "text-rose-700" : ""}`}>{v > 0 ? "+" : ""}{v}</span>
            </div>
          ))}
          <p className="mt-3 text-xs text-black/50">
            Only money-verified outcomes count. Max 3 deals per counterparty. A ghost costs 300; every ghost by someone you
            vouched for costs you 150.
          </p>
        </section>

        <section className="card space-y-3">
          <div className="label">Vouched for by</div>
          {t.vouchers.length === 0 ? <p className="text-sm text-black/50">No vouches yet.</p> : null}
          {t.vouchers.map((v) => (
            <div key={v.voucher_id} className="text-sm">
              <a href={`/u/${v.voucher_id}`} className="font-medium hover:underline">{v.voucher_name}</a>
              <span className="text-black/50"> · score {v.voucher_score} · adds +{v.weight}</span>
              {v.note ? <div className="text-black/60">“{v.note}”</div> : null}
            </div>
          ))}
          {given.length ? (
            <div className="text-sm text-black/60">Vouches for: {given.map((g) => g.name).join(", ")}</div>
          ) : null}
          {me && me.id !== u.id && !already ? (
            <form action={vouch} className="space-y-2 border-t border-black/5 pt-3">
              <input type="hidden" name="vouchee" value={u.id} />
              <input className="input" name="note" placeholder="How do you know their work?" required />
              <button className="btn">Vouch — put my score on the line</button>
              <p className="text-xs text-black/50">If they ghost a client after this, you lose 150 points.</p>
            </form>
          ) : null}
        </section>
      </div>

      <section className="card">
        <div className="label mb-3">Recent outcomes</div>
        <ul className="space-y-1 text-sm">
          {events.map((e) => (
            <li key={e.id} className={e.type === "GHOSTED" ? "text-rose-700" : ""}>
              {new Date(e.created_at).toLocaleDateString("en-IN")} · {EVENT_TEXT[e.type]} · ₹{(e.amount / 100).toLocaleString("en-IN")}
            </li>
          ))}
        </ul>
        <a href={`/api/trust/${u.id}`} className="mt-3 inline-block font-mono text-xs text-sky-700 underline">GET /api/trust/{u.id}</a>
      </section>
    </div>
  );
}
