import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow } from "@/lib/db";
import { panOk, gstinOk, trustScore } from "@/lib/score";
import { vouch } from "../../actions";
import { ScoreChip } from "../../score-chip";
import { Stagger, StaggerItem } from "@/components/motion";
import { day, firstName } from "../../format";
import { SubmitButton } from "@/components/submit-button";

const OUTCOME: Record<string, [string, string]> = {
  DELIVERED: ["Paid", "chip-emerald"],
  ACCEPTED: ["Accepted", "chip-emerald"],
  AUTO_RELEASED: ["Paid after silence", "chip-amber"],
  GHOSTED: ["Missed deadline", "chip-rose"],
  REFUNDED: ["Refunded", "chip-rose"],
};

const PART: Record<string, string> = {
  identity: "Identity",
  track: "Deals finished",
  reliability: "On time",
  penalties: "Missed deadlines",
  cascade: "Lost through vouches",
  vouches: "Vouches received",
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
    .prepare(
      `select e.*, d.title, c.name as counterparty from events e
       left join milestones m on m.id = e.milestone_id left join deals d on d.id = m.deal_id
       left join user c on c.id = e.counterparty_id
       where e.user_id = ? and e.type != 'FUNDED' order by e.created_at desc limit 12`,
    )
    .all(u.id) as (EventRow & { title: string | null; counterparty: string | null })[];
  const already = me ? t.vouchers.some((v) => v.voucher_id === me.id) : false;
  const canVouch = !!me && me.id !== u.id && !already;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreChip userId={u.id} name={u.name} size="lg" link={false} />
        <div className="flex flex-wrap gap-2">
          {panOk(u.pan) ? <span className="chip-zinc">PAN on file</span> : null}
          {gstinOk(u.gstin) ? <span className="chip-zinc">GSTIN on file</span> : null}
        </div>
      </header>

      <section className="hairline grid lg:grid-cols-2">
        <div className="py-10 lg:pr-12">
          <h2 className="text-xl font-semibold tracking-tight">Where the score comes from</h2>
          <Stagger as="ul" inView className="mt-6 text-sm">
            {Object.entries(t.parts).filter(([, v]) => v !== 0).map(([k, v]) => (
              <StaggerItem as="li" key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-3">
                <span className="text-ink-2">{PART[k] ?? k}</span>
                <span className={`font-medium tabular-nums ${v < 0 ? "text-rose-700" : "text-ink"}`}>
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
            Only paid deals count. A missed deadline costs 300.
          </p>
        </div>

        <div className="border-t border-line py-10 lg:border-t-0 lg:border-l lg:pl-12">
          <h2 className="text-xl font-semibold tracking-tight">Vouches</h2>
          {t.vouchers.length === 0 ? <p className="mt-4 text-sm text-muted">None yet.</p> : null}
          {t.vouchers.length ? <ul className="mt-6">
            {t.vouchers.map((v) => (
              <li key={v.voucher_id} className="border-t border-line py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/u/${v.voucher_id}`} className="link font-medium">{firstName(v.voucher_name)}</Link>
                  <span className="text-xs text-muted tabular-nums">score {v.voucher_score} · adds <span className="font-medium text-emerald-700">+{v.weight}</span></span>
                </div>
                {v.note ? <p className="mt-1 text-ink-2">“{v.note}”</p> : null}
              </li>
            ))}
          </ul> : null}
          {given.length ? (
            <p className="mt-4 text-sm text-muted">Vouches for: <span className="text-ink-2">{given.map((g) => firstName(g.name)).join(", ")}</span></p>
          ) : null}
          {canVouch ? (
            <form action={vouch} className={t.vouchers.length ? "mt-8 border-t border-line pt-6" : "mt-4"}>
              <input type="hidden" name="vouchee" value={u.id} />
              <label className="block space-y-1.5">
                <span className="block font-semibold text-ink">Vouch for {firstName(u.name)}</span>
                <input className="input" name="note" placeholder="How do you know their work?" required />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <SubmitButton className="btn-ink" busy="Vouching…">Vouch with my score</SubmitButton>
                <p className="text-xs text-muted">If they miss a deadline after this, you lose 150 points.</p>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <section className="section">
        <h2 className="text-xl font-semibold tracking-tight">Recent outcomes</h2>
        {events.length === 0 ? <p className="mt-4 text-sm text-muted">No finished deals yet.</p> : null}
        <Stagger as="ul" inView className="mt-6">
          {events.map((e) => (
            <StaggerItem as="li" key={e.id} className="grid grid-cols-[4rem_1fr_auto] items-baseline gap-4 border-t border-line py-3 text-sm">
              <span className="text-xs text-muted tabular-nums">{day(e.created_at)}</span>
              <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="truncate text-ink">{e.title ?? (e.counterparty ? `Deal with ${firstName(e.counterparty)}` : "Deal")}</span>
                {OUTCOME[e.type] ? <span className={OUTCOME[e.type][1]}>{OUTCOME[e.type][0]}</span> : null}
              </span>
              <span className="font-medium tabular-nums">₹{(e.amount / 100).toLocaleString("en-IN")}</span>
            </StaggerItem>
          ))}
        </Stagger>
        <a href={`/api/trust/${u.id}`} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block text-xs text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
          This score as JSON
        </a>
      </section>
    </div>
  );
}
