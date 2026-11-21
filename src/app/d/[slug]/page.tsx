import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow, type Milestone } from "@/lib/db";
import { getDealBySlug, getMilestones, scoreChanges, isEditable } from "@/lib/deals";
import { ScoreChip, StableNumber, profileHref } from "../../score-chip";
import { accept, fastForward, fund, submit } from "../../actions";
import { ArrowDown, ArrowRight, ArrowUp, Check, ExternalLink, MessageCircle, Pencil, X } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { BackLink } from "@/components/back-link";
import { siteOrigin, whatsappHref } from "./share";
import { Stagger, StaggerItem } from "@/components/motion";
import { Disclosure, SendBackForm } from "./deal-motion";
import { day, firstName as first, inr, when } from "../../format";
import { SubmitButton } from "@/components/submit-button";

type Viewer = "client" | "freelancer" | "other";
const DAY = 86_400_000;
const hoursUntil = (t: number) => Math.max(0, Math.ceil((t - Date.now()) / 3_600_000));
const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
type Names = { freelancer: string; client: string };

const STATE: Record<string, { label: string; tone: string; note: string }> = {
  AGREED: { label: "Not funded yet", tone: "chip-zinc", note: "Work starts once this says Held by Razorpay." },
  FUNDING: { label: "Confirming payment…", tone: "chip-zinc", note: "" },
  FUNDED: { label: "Held by Razorpay", tone: "chip-emerald", note: "Work can start." },
  SUBMITTED: { label: "Delivered · in review", tone: "chip-amber", note: "The client has 72 hours to accept or send it back. No reply means accepted." },
  RELEASING: { label: "Paying out…", tone: "chip-amber", note: "" },
  RELEASED: { label: "Paid out", tone: "chip-emerald", note: "" },
  REFUNDING: { label: "Refunding…", tone: "chip-rose", note: "" },
  REFUNDED: { label: "Refunded to client", tone: "chip-rose", note: "" },
  DISPUTED: { label: "Disputed", tone: "chip-rose", note: "Sent back twice. Razorpay keeps holding the money." },
};

// Line 1 avoids the exact "Held by Razorpay" status label so e2e text matches stay unique.
const REASSURE = [
  "Razorpay holds the money",
  "Released when you accept, or 72 hours after delivery",
  "Full refund if nothing is delivered",
];

const AGREED_NOTE: Record<Viewer, (n: Names, amount: number) => string> = {
  client: (n, a) => `Razorpay holds your ${inr(a)} until ${n.freelancer} delivers. Miss the deadline and it comes back to you.`,
  freelancer: () => "Start once this says Held by Razorpay.",
  other: () => STATE.AGREED.note,
};

const SENT_BACK = "Sent back. Fix the items in red and deliver again within 48 hours.";

const REVIEW_NOTE: Record<Viewer, (n: Names) => string> = {
  client: (n) => `You have 72 hours to accept or send it back. If you say nothing, ${n.freelancer} is paid.`,
  freelancer: (n) => `${n.client} has 72 hours to reply. If they say nothing, you're paid.`,
  other: () => STATE.SUBMITTED.note,
};

const OUTCOME: Record<string, Record<Viewer, (n: Names) => string>> = {
  accepted: {
    client: () => "You accepted the work.",
    freelancer: (n) => `${n.client} accepted. You've been paid.`,
    other: () => "The client accepted the work.",
  },
  auto_released: {
    client: (n) => `You didn't reply for 72 hours, so ${n.freelancer} was paid.`,
    freelancer: () => "No reply for 72 hours, so you were paid.",
    other: () => "The client didn't reply for 72 hours, so the freelancer was paid.",
  },
  ghosted: {
    client: () => "Nothing was delivered by the deadline, so you were refunded.",
    freelancer: (n) => `You missed the deadline, so ${n.client} was refunded.`,
    other: () => "The deadline passed with nothing delivered, so the client was refunded.",
  },
};

const EVENT_TEXT: Record<string, string> = {
  FUNDED: "paid for a milestone, now held",
  DELIVERED: "delivered and was paid",
  ACCEPTED: "accepted the work and released the money",
  AUTO_RELEASED: "didn't reply, so the money was released",
  GHOSTED: "missed the deadline",
  REFUNDED: "got a full refund",
};

const EVENT_DOT: Record<string, string> = {
  FUNDED: "bg-emerald-600",
  DELIVERED: "bg-emerald-600",
  ACCEPTED: "bg-emerald-600",
  AUTO_RELEASED: "bg-amber-500",
  GHOSTED: "bg-rose-600",
  REFUNDED: "bg-rose-600",
};

export async function generateMetadata({ params }: PageProps<"/d/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) notFound();
  const total = getMilestones(deal.id).reduce((s, m) => s + m.amount, 0);
  const freelancer = first(getUser(deal.freelancer_id)?.name ?? "A freelancer");
  const title = `${deal.title} · ${inr(total)} · Pakka`;
  const description = `${freelancer} sent you a Pakka link. Pay up front, Razorpay holds it until the work is delivered.`;
  return { title: { absolute: title }, description, openGraph: { title, description, url: `/d/${slug}` } };
}

export default async function DealPage({ params, searchParams }: PageProps<"/d/[slug]">) {
  const { slug } = await params;
  const fundingPending = (await searchParams).funding === "pending";
  const deal = getDealBySlug(slug);
  if (!deal) notFound();
  const me = await currentUser();
  const milestones = getMilestones(deal.id);
  const freelancer = getUser(deal.freelancer_id)!;
  const client = deal.client_id ? getUser(deal.client_id) : null;
  const isFreelancer = me?.id === deal.freelancer_id;
  const isClient = !!me && !isFreelancer && (!deal.client_id || deal.client_id === me.id);
  const events = db
    .prepare(
      `select e.*, u.name from events e join user u on u.id = e.user_id
       where e.milestone_id in (select id from milestones where deal_id = ?) order by e.created_at desc, e.id desc`,
    )
    .all(deal.id) as (EventRow & { name: string })[];
  const total = milestones.reduce((s, m) => s + m.amount, 0);
  const viewer: Viewer = isFreelancer ? "freelancer" : isClient ? "client" : "other";
  const names: Names = { freelancer: first(freelancer.name), client: client ? first(client.name) : "The client" };
  const nextToFund = milestones.find((m) => m.state === "AGREED")?.id;
  const dealUrl = `${await siteOrigin()}/d/${slug}`;
  const here = `/d/${slug}`;
  const settledAt = new Map(
    events.filter((e) => e.type === "DELIVERED" || e.type === "REFUNDED").map((e) => [e.milestone_id, e.created_at]),
  );
  const anchor = (m: Milestone) => `#m-${m.idx + 1}`;
  const inReview = milestones.find((m) => m.state === "SUBMITTED");
  const held = milestones.find((m) => m.state === "FUNDED");
  const toFund = milestones.find((m) => m.id === nextToFund);
  const nothingFunded = milestones.every((m) => m.state === "AGREED");
  let next: { text: string; href?: string } | null = null;
  if (isFreelancer) {
    if (held) next = { text: `Deliver ${held.title} by ${day(held.due_at)}`, href: anchor(held) };
    else if (inReview) next = { text: `${inReview.title} is with ${names.client} for review`, href: anchor(inReview) };
    else if (nothingFunded) next = { text: "Next: send this link to your client." };
  } else if (isClient || !me) {
    if (isClient && inReview?.review_due_at)
      next = { text: `${inReview.title} is waiting for your review · ${hoursUntil(inReview.review_due_at)}h left`, href: anchor(inReview) };
    else if (toFund) next = { text: `Next: fund milestone ${toFund.idx + 1}, ${inr(toFund.amount)}`, href: anchor(toFund) };
  }
  const shareInline = isFreelancer && nothingFunded;
  const shareTools = (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={here} href label="Copy Pakka link" size="md" />
      <a href={whatsappHref(dealUrl, deal.title)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
        <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
        Share on WhatsApp
      </a>
      {isFreelancer && isEditable(deal.id) ? (
        <Link href={`/d/${slug}/edit`} className="btn-ghost">
          <Pencil size={16} strokeWidth={1.75} aria-hidden />
          Edit deal
        </Link>
      ) : null}
    </div>
  );

  return (
    <article>
      {me ? <div className="pb-6"><BackLink href="/dashboard" label="Your deals" /></div> : null}
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div className="max-w-3xl">
          <h1 className="text-title">{deal.title}</h1>
          <p className="mt-3 text-ink-2">
            <span className="font-medium text-ink tabular-nums">{inr(total)}</span> across {milestones.length} milestone
            {milestones.length === 1 ? "" : "s"}. Razorpay holds each one until it&apos;s delivered.
          </p>
          {next ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              {next.href ? (
                <a href={next.href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  <span className="underline decoration-line-strong underline-offset-4 transition-colors group-hover:decoration-emerald-600">{next.text}</span>
                  <ArrowDown size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-emerald-700" />
                </a>
              ) : (
                <p className="text-sm font-medium text-ink">{next.text}</p>
              )}
              {shareInline ? shareTools : null}
            </div>
          ) : null}
        </div>
        {shareInline ? null : isFreelancer ? shareTools : <CopyButton value={here} href label="Copy link" />}
      </header>

      {fundingPending && nextToFund ? (
        <p role="status" className="hairline bg-amber-50 py-4 text-sm text-amber-900">
          We couldn&apos;t confirm your payment yet. If you paid, press Fund again in a minute. You won&apos;t be charged twice.
        </p>
      ) : null}

      <section className="hairline grid sm:grid-cols-2">
        <div className="py-8 sm:pr-10">
          <ScoreChip userId={freelancer.id} name={freelancer.name} role="Freelancer" from={here} />
        </div>
        <div className="flex items-center border-t border-line py-8 sm:border-t-0 sm:border-l sm:pl-10">
          {client ? (
            <ScoreChip userId={client.id} name={client.name} role="Client" from={here} />
          ) : (
            <div>
              <div className="label">Client</div>
              <p className="mt-1 text-ink-2">
                {isClient ? "That's you, once you fund milestone 1." : isFreelancer ? "Your client joins when they fund milestone 1." : "Whoever funds milestone 1."}
              </p>
            </div>
          )}
        </div>
      </section>

      {milestones.map((m) => (
        <MilestoneSection
          key={m.id}
          m={m}
          slug={slug}
          viewer={viewer}
          names={names}
          fundNext={m.id === nextToFund}
          signedIn={!!me}
          createdAt={deal.created_at}
          settledAt={settledAt.get(m.id)}
        />
      ))}

      {events.length ? (
        <section className="section">
          <h2 className="text-heading">Record</h2>
          <ol className="mt-6 ml-1 border-l border-line">
            {events.map((e) => (
              <li key={e.id} className="relative pb-6 pl-6 last:pb-0">
                <span aria-hidden className={`absolute top-1.5 -left-[4.5px] size-2 rounded-full ring-4 ring-paper ${EVENT_DOT[e.type] ?? "bg-line-strong"}`} />
                <div className="text-sm text-ink-2">
                  <span className="font-medium text-ink">{e.name}</span> {EVENT_TEXT[e.type]} ·{" "}
                  <span className="font-medium text-ink tabular-nums">{inr(e.amount)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-meta text-muted tabular-nums">
                  <span>{when(e.created_at)}</span>
                  {e.ref ? <span className="font-mono text-xs">{e.ref}</span> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}

function MilestoneSection({ m, slug, viewer, names, fundNext, signedIn, createdAt, settledAt }: {
  m: Milestone; slug: string; viewer: Viewer; names: Names; fundNext: boolean; signedIn: boolean; createdAt: number; settledAt?: number;
}) {
  const isFreelancer = viewer === "freelancer";
  const isClient = viewer === "client";
  const checklist = JSON.parse(m.checklist) as string[];
  const ticks = new Set<number>(m.evidence_ticks ? JSON.parse(m.evidence_ticks) : []);
  const rejected = new Set<number>(m.rejected_items ? JSON.parse(m.rejected_items) : []);
  const s = STATE[m.state];
  const sentBack = m.state === "FUNDED" && rejected.size > 0;
  const note = sentBack
    ? SENT_BACK
    : m.state === "SUBMITTED"
      ? REVIEW_NOTE[viewer](names)
      : m.state === "AGREED"
        ? fundNext
          ? AGREED_NOTE[viewer](names, m.amount)
          : isFreelancer
            ? "Your client can fund this later."
            : "You can fund this later."
        : s.note;
  const fundClass = fundNext ? "btn" : "btn-ghost";
  const canFund = m.state === "AGREED" && isClient;
  const needsSignIn = m.state === "AGREED" && !signedIn;
  const canSubmit = m.state === "FUNDED" && isFreelancer;
  const canReview = m.state === "SUBMITTED" && isClient;
  const canForward = (m.state === "FUNDED" || m.state === "SUBMITTED") && (isClient || isFreelancer);
  const hoursLeft = m.review_due_at ? hoursUntil(m.review_due_at) : 0;
  const daysToDeliver = Math.max(1, Math.round((m.due_at - createdAt) / DAY));

  return (
    <section id={`m-${m.idx + 1}`} className="section scroll-mt-20">
      <div className="grid grid-cols-[1.25rem_1fr] items-baseline gap-x-5 gap-y-3 sm:grid-cols-[1.25rem_1fr_auto]">
        <span className="text-sm text-muted tabular-nums">{String(m.idx + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h2 className="text-heading">{m.title}</h2>
          {m.round > 1 ? <div className="mt-1 text-meta text-muted">Revision {m.round - 1}</div> : null}
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-3 sm:col-start-3">
          <span className="text-heading tabular-nums">{inr(m.amount)}</span>
          <span className={s.tone}><span className="dot" />{s.label}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 sm:pl-10 md:grid-cols-[1.4fr_1fr] md:gap-12">
        {canSubmit ? (
          <form action={submit} className="space-y-6">
            <input type="hidden" name="m" value={m.id} />
            <input type="hidden" name="slug" value={slug} />
            <fieldset>
              <legend className="label">Tick each item you delivered</legend>
              <div className="mt-2 border-t border-line">
                {checklist.map((c, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-3 border-b border-line py-2.5 text-sm transition-colors hover:bg-wash">
                    <input type="checkbox" name={`tick_${i}`} className="mt-0.5 size-4 shrink-0" required />
                    <span className={rejected.has(i) ? "text-rose-700" : "text-ink"}>{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block space-y-1.5">
              <span className="label block">Where&apos;s the work?</span>
              <input className="input" name="url" type="url" inputMode="url" placeholder="Link to the work (staging URL, Figma, Drive…)" required />
            </label>
            <SubmitButton className="btn" busy="Mark delivered · sending…">Mark delivered</SubmitButton>
          </form>
        ) : (
          <div>
            <h3 className="label">Delivered means</h3>
            <ul className="mt-2 border-t border-line">
              {checklist.map((c, i) => {
                const bad = rejected.has(i);
                const ok = ticks.has(i);
                return (
                  <li key={i} className="flex items-start gap-3 border-b border-line py-2.5 text-sm">
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-sm border ${
                        bad ? "border-rose-300 bg-rose-50 text-rose-700" : ok ? "border-emerald-600 bg-emerald-600 text-white" : "border-line-strong"
                      }`}
                    >
                      {bad ? <X size={12} strokeWidth={2.25} /> : ok ? <Check size={12} strokeWidth={2.25} /> : null}
                    </span>
                    <span className={bad ? "text-rose-700" : "text-ink"}>{c}</span>
                  </li>
                );
              })}
            </ul>
            {m.evidence_url ? (
              <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                <a href={m.evidence_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                  Open the work
                </a>
                <span className="min-w-0 truncate text-meta text-muted">{hostOf(m.evidence_url)}</span>
              </div>
            ) : null}
          </div>
        )}

        <dl className="space-y-4 text-sm">
          {m.review_due_at && m.state === "SUBMITTED" ? (
            <div>
              <dt className="label">Pays out automatically on</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {when(m.review_due_at)} <span className="font-normal text-muted">· in {hoursLeft}h</span>
              </dd>
            </div>
          ) : m.state === "RELEASED" || m.state === "REFUNDED" ? (
            settledAt ? (
              <div>
                <dt className="label">{m.state === "RELEASED" ? "Paid on" : "Refunded on"}</dt>
                <dd className="mt-1 font-medium tabular-nums">{day(settledAt)}</dd>
              </div>
            ) : null
          ) : (
            <div>
              <dt className="label">Deadline</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {m.state === "AGREED" ? `${daysToDeliver} day${daysToDeliver === 1 ? "" : "s"} after funding` : day(m.due_at)}
              </dd>
            </div>
          )}
          {note ? <p className={sentBack ? "text-rose-700" : "text-ink-2"}>{note}</p> : null}
          {m.outcome && OUTCOME[m.outcome] ? <p className="font-medium text-ink">{OUTCOME[m.outcome][viewer](names)}</p> : null}
          {m.transfer_id || m.refund_id ? (
            <div className="space-y-0.5 font-mono text-xs text-muted">
              {m.transfer_id ? <div>Razorpay ref {m.transfer_id}</div> : null}
              {m.refund_id ? <div>Refund ref {m.refund_id}</div> : null}
            </div>
          ) : null}
        </dl>
      </div>

      {canFund || needsSignIn || canReview || canForward ? (
        <div className="mt-8 space-y-6 border-t border-line pt-6 sm:ml-10">
          {canFund || needsSignIn ? (
            <div>
              {canFund ? (
                <form action={fund}>
                  <input type="hidden" name="m" value={m.id} />
                  <SubmitButton className={fundClass} busy={`Fund ${inr(m.amount)} · opening Razorpay…`}>Fund {inr(m.amount)} · held until delivered</SubmitButton>
                </form>
              ) : (
                <Link href={`/login?next=/d/${slug}`} className={fundClass}>Sign in to fund</Link>
              )}
              {fundNext ? <Reassurance /> : null}
            </div>
          ) : null}

          {canReview ? (
            <div className="max-w-2xl space-y-6">
              <form action={accept}>
                <input type="hidden" name="m" value={m.id} />
                <input type="hidden" name="slug" value={slug} />
                <SubmitButton className="btn" busy="Paying out…">Accept and pay {names.freelancer} {inr(m.amount)}</SubmitButton>
              </form>
              <Disclosure label="Something missing? Send it back.">
                <SendBackForm milestoneId={m.id} slug={slug} checklist={checklist} freelancer={names.freelancer} />
              </Disclosure>
            </div>
          ) : null}

          {canForward ? (
            <form action={fastForward}>
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <SubmitButton className="btn-ghost btn-sm border-dashed text-muted hover:text-ink">
                Demo: fast-forward {m.state === "FUNDED" ? "past deadline" : "72h of client silence"}
              </SubmitButton>
            </form>
          ) : null}
        </div>
      ) : null}

      <ScoreChanges milestoneId={m.id} from={`/d/${slug}`} />
    </section>
  );
}

function Reassurance() {
  return (
    <div className="mt-6 max-w-3xl">
      <ul className="grid border-y border-line text-meta text-ink-2 sm:grid-cols-3">
        {REASSURE.map((text) => (
          <li key={text} className="border-line py-3 not-first:border-t sm:px-4 sm:first:pl-0 sm:not-first:border-t-0 sm:not-first:border-l">
            {text}
          </li>
        ))}
      </ul>
      <Link href="/paying" className="link mt-3 inline-block text-meta">How Pakka protects you</Link>
    </div>
  );
}

function ScoreChanges({ milestoneId, from }: { milestoneId: string; from: string }) {
  const changes = scoreChanges(milestoneId).filter((c) => c.after !== c.before);
  if (!changes.length) return null;
  const fresh = changes.some((c) => Date.now() - c.created_at < 60_000);
  return (
    <div className="hairline mt-12 -mb-12 bg-wash pt-10 sm:mt-16 sm:-mb-16">
      <h3 className="text-heading">What this outcome did to trust</h3>
      <Stagger as="ul" inView force={fresh} gap={0.08} className="mx-[calc(var(--rail-pad)*-1)] mt-6 grid gap-px border-t border-line bg-line sm:grid-cols-2">
        {changes.map((c) => {
          const up = c.after > c.before;
          const d = c.after - c.before;
          return (
            <StaggerItem as="li" key={c.id} className="bg-wash px-(--rail-pad) py-8 sm:last:odd:col-span-2">
              <Link href={profileHref(c.user_id, from)} className="link font-medium">{c.name}</Link>
              <p className="mt-1 text-sm text-muted">{c.reason}</p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="text-2xl text-muted tabular-nums">{c.before}</span>
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden className="self-center text-muted" />
                <StableNumber from={c.before} to={c.after} force={fresh} className="text-5xl font-semibold tracking-[-0.03em] text-ink" />
                <span className={up ? "chip-emerald" : "chip-rose"}>
                  {up ? <ArrowUp size={12} strokeWidth={2} aria-hidden /> : <ArrowDown size={12} strokeWidth={2} aria-hidden />}
                  {up ? "+" : ""}{d}
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
