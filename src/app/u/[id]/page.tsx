import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow } from "@/lib/db";
import { panOk, gstinOk, trustScore } from "@/lib/score";
import { vouch } from "../../actions";
import { ScoreChip } from "../../score-chip";
import { day, firstName, inr, safeNext } from "../../format";
import { SubmitButton } from "@/components/submit-button";
import { BackLink } from "@/components/back-link";
import { BadgeCheck, BadgeIndianRupee, ExternalLink, type LucideIcon } from "lucide-react";
import { Tip } from "../../d/[slug]/share";

const OUTCOME: Record<string, [string, string]> = {
  DELIVERED: ["Paid", "chip-emerald"],
  ACCEPTED: ["Accepted", "chip-emerald"],
  AUTO_RELEASED: ["Paid after silence", "chip-amber"],
  GHOSTED: ["Missed deadline", "chip-rose"],
  REFUNDED: ["Refunded", "chip-rose"],
};

function Verified({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <Tip label={label}>
      <span role="img" aria-label={label} tabIndex={0} className="inline-flex rounded-sm text-emerald-600">
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </span>
    </Tip>
  );
}

const PART: Record<string, string> = {
  identity: "Identity",
  track: "Deals finished",
  reliability: "On time",
  penalties: "Missed deadlines",
  cascade: "Lost through vouches",
  vouches: "Vouches received",
};

export async function generateMetadata({ params }: PageProps<"/u/[id]">): Promise<Metadata> {
  const u = getUser((await params).id);
  if (!u) notFound();
  const title = `${firstName(u.name)} · Pakka score ${trustScore(u.id).score}`;
  const description = `${firstName(u.name)}'s trust score on Pakka, built from real payments held by Razorpay.`;
  return { title: { absolute: title }, description, openGraph: { title, description, url: `/u/${u.id}` } };
}

export default async function Profile({ params, searchParams }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const from = safeNext((await searchParams).from);
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
      <div className="pb-6">
        {from.startsWith("/d/") ? (
          <BackLink href={from} label="Back to the deal" />
        ) : me ? (
          <BackLink href="/dashboard" label="Your deals" />
        ) : (
          <BackLink href="/" label="Home" />
        )}
      </div>
      <header className="pb-12">
        <ScoreChip
          userId={u.id}
          name={u.name}
          size="lg"
          link={false}
          badges={
            panOk(u.pan) || gstinOk(u.gstin) ? (
              <>
                {panOk(u.pan) ? <Verified label="PAN checked" icon={BadgeCheck} /> : null}
                {gstinOk(u.gstin) ? <Verified label="GSTIN checked" icon={BadgeIndianRupee} /> : null}
              </>
            ) : null
          }
        />
      </header>

      <section className="hairline grid lg:grid-cols-2">
        <div className="py-10 lg:pr-12">
          <h2 className="text-heading">Where the score comes from</h2>
          <ul className="mt-4 text-sm">
            {Object.entries(t.parts).filter(([, v]) => v !== 0).map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-3">
                <span className="text-ink-2">{PART[k] ?? k}</span>
                <span className={`font-medium tabular-nums ${v < 0 ? "text-rose-700" : "text-ink"}`}>
                  {v > 0 ? "+" : ""}{v}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 border-t border-ink py-3">
              <span className="font-medium">Score</span>
              <span className="font-medium tabular-nums">{t.score}</span>
            </li>
          </ul>
          <p className="mt-2 max-w-prose text-meta text-muted">
            Only paid deals count. A missed deadline costs 300.
          </p>
        </div>

        <div className="border-t border-line py-10 lg:border-t-0 lg:border-l lg:pl-12">
          <h2 className="text-heading">Vouches</h2>
          {t.vouchers.length === 0 ? <p className="mt-4 text-sm text-muted">None yet.</p> : null}
          {t.vouchers.length ? <ul className="mt-4">
            {t.vouchers.map((v) => (
              <li key={v.voucher_id} className="border-t border-line py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/u/${v.voucher_id}`} className="link font-medium">{firstName(v.voucher_name)}</Link>
                  <span className="text-meta text-muted tabular-nums">score {v.voucher_score} · adds <span className="font-medium text-emerald-700">+{v.weight}</span></span>
                </div>
                {v.note ? <p className="mt-1 text-ink-2">“{v.note}”</p> : null}
              </li>
            ))}
          </ul> : null}
          {given.length ? (
            <p className="mt-4 text-meta text-muted">Vouches for: <span className="text-ink-2">{given.map((g) => firstName(g.name)).join(", ")}</span></p>
          ) : null}
          {canVouch ? (
            <form action={vouch} className={t.vouchers.length ? "mt-8 border-t border-line pt-6" : "mt-4"}>
              <input type="hidden" name="vouchee" value={u.id} />
              <label className="block space-y-1.5">
                <span className="block font-medium text-ink">Vouch for {firstName(u.name)}</span>
                <input className="input" name="note" placeholder="How do you know their work?" required />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <SubmitButton className="btn" busy="Vouching…">Vouch with my score</SubmitButton>
                <p className="text-meta text-muted">If they miss a deadline after this, you lose 150 points.</p>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <section className="section">
        <h2 className="text-heading">Recent outcomes</h2>
        {events.length === 0 ? <p className="mt-4 text-sm text-muted">No finished deals yet.</p> : null}
        <ul className="mt-4">
          {events.map((e) => (
            <li key={e.id} className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-3 text-sm">
              <span className="text-meta text-muted tabular-nums">{day(e.created_at)}</span>
              <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="truncate text-ink">{e.title ?? (e.counterparty ? `Deal with ${firstName(e.counterparty)}` : "Deal")}</span>
                {OUTCOME[e.type] ? <span className={OUTCOME[e.type][1]}><span className="dot" />{OUTCOME[e.type][0]}</span> : null}
              </span>
              <span className="font-medium tabular-nums">{inr(e.amount)}</span>
            </li>
          ))}
        </ul>
        <a href={`/api/trust/${u.id}`} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-1.5 text-meta text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
          This score as JSON
          <ExternalLink size={12} strokeWidth={1.75} aria-hidden />
        </a>
      </section>
    </div>
  );
}
