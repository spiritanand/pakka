import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow } from "@/lib/db";
import { panOk, gstinOk, trustScore } from "@/lib/score";
import { vouch } from "../../actions";
import { ScoreChip } from "../../score-chip";
import { Stagger, StaggerItem } from "@/components/motion";

const EVENT_TEXT: Record<string, string> = {
  DELIVERED: "Delivered and paid",
  ACCEPTED: "Accepted the work",
  AUTO_RELEASED: "Didn't reply in review, paid out automatically",
  GHOSTED: "Missed the deadline, client refunded",
  REFUNDED: "Got a refund",
};

const PART: Record<string, string> = {
  identity: "Identity",
  track: "Track record",
  reliability: "Reliability",
  penalties: "Penalties",
  cascade: "Losses from people you vouched for",
  vouches: "Vouches",
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
    <div>
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreChip userId={u.id} name={u.name} size="lg" />
        <div className="flex flex-wrap gap-2">
          <span className={panOk(u.pan) ? "chip-emerald" : "chip-zinc"}>{panOk(u.pan) ? "PAN checked" : "No PAN"}</span>
          <span className={gstinOk(u.gstin) ? "chip-emerald" : "chip-zinc"}>{gstinOk(u.gstin) ? "GSTIN checked" : "No GSTIN"}</span>
        </div>
      </header>

      <section className="hairline grid lg:grid-cols-2">
        <div className="py-10 lg:pr-12">
          <h2 className="text-xl font-semibold tracking-tight">Where the score comes from</h2>
          <Stagger as="ul" inView className="mt-6 text-sm">
            {Object.entries(t.parts).map(([k, v]) => (
              <StaggerItem as="li" key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-3">
                <span className="text-ink-2">{PART[k] ?? k}</span>
                <span className={`font-medium tabular-nums ${v < 0 ? "text-rose-700" : v > 0 ? "text-ink" : "text-faint"}`}>
                  {v > 0 ? "+" : ""}{v}
                </span>
              </StaggerItem>
            ))}
            <StaggerItem as="li" className="flex items-baseline justify-between gap-4 border-t-2 border-ink py-3">
              <span className="font-semibold">Score</span>
              <span className="text-lg font-semibold tabular-nums">{t.score}</span>
            </StaggerItem>
          </Stagger>
          <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted">
            Only paid deals count. Missing a funded deadline costs 300.
          </p>
        </div>

        <div className="border-t border-line py-10 lg:border-t-0 lg:border-l lg:pl-12">
          <h2 className="text-xl font-semibold tracking-tight">Vouched for by</h2>
          {t.vouchers.length === 0 ? <p className="mt-4 max-w-sm text-sm text-muted">No vouches yet. A vouch from someone with a good score raises this one.</p> : null}
          <ul className="mt-6">
            {t.vouchers.map((v) => (
              <li key={v.voucher_id} className="border-t border-line py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/u/${v.voucher_id}`} className="link font-medium">{v.voucher_name}</Link>
                  <span className="text-xs text-muted tabular-nums">score {v.voucher_score} · adds <span className="font-medium text-emerald-700">+{v.weight}</span></span>
                </div>
                {v.note ? <p className="mt-1 text-ink-2">“{v.note}”</p> : null}
              </li>
            ))}
          </ul>
          {given.length ? (
            <p className="mt-4 text-sm text-muted">Vouches for: <span className="text-ink-2">{given.map((g) => g.name).join(", ")}</span></p>
          ) : null}
          {me && me.id !== u.id && !already ? (
            <form action={vouch} className="mt-8 border-t border-line pt-6">
              <input type="hidden" name="vouchee" value={u.id} />
              <label className="block space-y-1.5">
                <span className="block font-semibold text-ink">Vouch for {u.name}</span>
                <input className="input" name="note" placeholder="How do you know their work?" required />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button className="btn-ink">Vouch with my score</button>
                <p className="text-xs text-muted">If they miss a funded deadline after this, you lose 150 points.</p>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent outcomes</h2>
          <a href={`/api/trust/${u.id}`} className="font-mono text-xs text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
            GET /api/trust/{u.id}
          </a>
        </div>
        {events.length === 0 ? <p className="mt-4 text-sm text-muted">No finished deals yet.</p> : null}
        <Stagger as="ul" inView className="mt-6">
          {events.map((e) => (
            <StaggerItem as="li" key={e.id} className="grid grid-cols-[4rem_1fr_auto] items-baseline gap-4 border-t border-line py-3 text-sm">
              <span className="text-xs text-faint tabular-nums">{new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span className={e.type === "GHOSTED" ? "font-medium text-rose-700" : "text-ink"}>{EVENT_TEXT[e.type]}</span>
              <span className="font-medium tabular-nums">₹{(e.amount / 100).toLocaleString("en-IN")}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
