import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow, type Milestone } from "@/lib/db";
import { getDealBySlug, getMilestones, scoreChanges } from "@/lib/deals";
import { ScoreChip, StableNumber } from "../../score-chip";
import { accept, fastForward, fund, reject, submit } from "../../actions";
import { CopyLink } from "./copy-link";
import { Stagger, StaggerItem } from "@/components/motion";
import { Disclosure, StatusChip } from "./deal-motion";
import { day, firstName as first, inr, when } from "../../format";
import { SubmitButton } from "@/components/submit-button";

type Viewer = "client" | "freelancer" | "other";
type Names = { freelancer: string; client: string };

const STATE: Record<string, { label: string; tone: string; note: string }> = {
  AGREED: { label: "Not funded yet", tone: "chip-zinc", note: "Work starts once this says Held by Razorpay." },
  FUNDING: { label: "Confirming payment…", tone: "chip-zinc", note: "" },
  FUNDED: { label: "Held by Razorpay", tone: "chip-emerald", note: "Razorpay is holding the money. Work can start." },
  SUBMITTED: { label: "Delivered · in review", tone: "chip-amber", note: "The client has 72 hours to accept or send it back. No reply means accepted." },
  RELEASING: { label: "Paying out…", tone: "chip-amber", note: "" },
  RELEASED: { label: "Paid out", tone: "chip-emerald", note: "" },
  REFUNDING: { label: "Refunding…", tone: "chip-rose", note: "" },
  REFUNDED: { label: "Refunded to client", tone: "chip-rose", note: "" },
  DISPUTED: { label: "Disputed", tone: "chip-rose", note: "Sent back twice. Razorpay keeps holding the money." },
};

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

  return (
    <article>
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div className="max-w-3xl">
          <div className="eyebrow">Pakka deal</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{deal.title}</h1>
          <p className="mt-4 text-ink-2">
            <span className="font-medium text-ink tabular-nums">{inr(total)}</span> across {milestones.length} milestone
            {milestones.length === 1 ? "" : "s"}. Razorpay holds each one until it's delivered.
          </p>
        </div>
        <CopyLink />
      </header>

      {fundingPending && nextToFund ? (
        <p role="status" className="hairline bg-amber-50 py-4 text-sm text-amber-900">
          We couldn't confirm your payment yet. If you paid, press Fund again in a minute. You won't be charged twice.
        </p>
      ) : null}

      <section className="hairline grid sm:grid-cols-2">
        <div className="py-8 sm:pr-10">
          <ScoreChip userId={freelancer.id} name={freelancer.name} role="Freelancer" />
        </div>
        <div className="flex items-center border-t border-line py-8 sm:border-t-0 sm:border-l sm:pl-10">
          {client ? (
            <ScoreChip userId={client.id} name={client.name} role="Client" />
          ) : (
            <div>
              <div className="text-[13px] text-muted">Client</div>
              <p className="mt-1 text-ink-2">
                {isClient ? "That's you, once you fund milestone 1." : isFreelancer ? "Your client joins when they fund milestone 1." : "Whoever funds milestone 1."}
              </p>
            </div>
          )}
        </div>
      </section>

      <Stagger delay={0.05} gap={0.08}>
        {milestones.map((m) => (
          <MilestoneSection
            key={m.id}
            m={m}
            slug={slug}
            viewer={viewer}
            names={names}
            fundNext={m.id === nextToFund}
            signedIn={!!me}
          />
        ))}
      </Stagger>

      {events.length ? (
        <section className="section">
          <h2 className="text-xl font-semibold tracking-tight">Record</h2>
          <p className="mt-1 text-[13px] text-muted">Each line links to a Razorpay reference.</p>
          <Stagger as="ol" inView gap={0.05} className="mt-8 ml-1 border-l border-line">
            {events.map((e) => (
              <StaggerItem as="li" key={e.id} className="relative pb-6 pl-6 last:pb-0">
                <span aria-hidden className={`absolute top-1.5 -left-[4.5px] size-2 rounded-full ring-4 ring-paper ${EVENT_DOT[e.type] ?? "bg-line-strong"}`} />
                <div className="text-sm text-ink-2">
                  <span className="font-semibold text-ink">{e.name}</span> {EVENT_TEXT[e.type]} ·{" "}
                  <span className="font-medium text-ink tabular-nums">{inr(e.amount)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted tabular-nums">
                  <span>{when(e.created_at)}</span>
                  {e.ref ? <span className="font-mono">{e.ref}</span> : null}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}
    </article>
  );
}

function MilestoneSection({ m, slug, viewer, names, fundNext, signedIn }: {
  m: Milestone; slug: string; viewer: Viewer; names: Names; fundNext: boolean; signedIn: boolean;
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
  const fundClass = `${fundNext ? "btn" : "btn-ghost"} h-11 px-5`;
  const canFund = m.state === "AGREED" && isClient;
  const needsSignIn = m.state === "AGREED" && !signedIn;
  const canSubmit = m.state === "FUNDED" && isFreelancer;
  const canReview = m.state === "SUBMITTED" && isClient;
  const canForward = (m.state === "FUNDED" || m.state === "SUBMITTED") && (isClient || isFreelancer);
  const hoursLeft = m.review_due_at ? Math.max(0, Math.ceil((m.review_due_at - Date.now()) / 3_600_000)) : 0;

  return (
    <StaggerItem as="section" className="section">
      <div className="grid grid-cols-[1.25rem_1fr] items-baseline gap-x-5 gap-y-3 sm:grid-cols-[1.25rem_1fr_auto]">
        <span className="font-mono text-sm text-muted tabular-nums">{String(m.idx + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{m.title}</h2>
          {m.round > 1 ? <div className="mt-1 text-[13px] text-muted">Revision {m.round - 1}</div> : null}
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-3 sm:col-start-3">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{inr(m.amount)}</span>
          <StatusChip state={m.state} tone={s.tone}><span className="dot" />{s.label}</StatusChip>
        </div>
      </div>

      <div className="mt-8 grid gap-10 sm:pl-10 md:grid-cols-[1.4fr_1fr]">
        {canSubmit ? (
          <form action={submit} className="space-y-6">
            <input type="hidden" name="m" value={m.id} />
            <input type="hidden" name="slug" value={slug} />
            <fieldset>
              <legend className="label">Tick each item you delivered</legend>
              <div className="mt-3 border-t border-line">
                {checklist.map((c, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-start gap-3 border-b border-line py-2.5 text-sm transition-colors hover:bg-wash"
                  >
                    <input type="checkbox" name={`tick_${i}`} className="mt-0.5 size-4 shrink-0 accent-emerald-700" required />
                    <span className={rejected.has(i) ? "text-rose-700" : "text-ink-2"}>{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block space-y-1.5">
              <span className="label block">Where's the work?</span>
              <input className="input" name="url" placeholder="Link to the work (staging URL, Figma, Drive…)" required />
            </label>
            <SubmitButton className="btn h-11 px-5" busy="Mark delivered · sending…">Mark delivered</SubmitButton>
          </form>
        ) : (
          <div>
            <h3 className="label">Delivered means</h3>
            <ul className="mt-3 border-t border-line">
              {checklist.map((c, i) => {
                const bad = rejected.has(i);
                const ok = ticks.has(i);
                return (
                  <li key={i} className="flex items-start gap-3 border-b border-line py-2.5 text-sm">
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-xs border text-[10px] leading-none ${
                        bad ? "border-rose-300 bg-rose-50 text-rose-700" : ok ? "border-emerald-600 bg-emerald-600 text-white" : "border-line-strong"
                      }`}
                    >
                      {bad ? "✗" : ok ? "✓" : ""}
                    </span>
                    <span className={bad ? "text-rose-700" : "text-ink"}>{c}</span>
                  </li>
                );
              })}
            </ul>
            {m.evidence_url ? (
              <a href={m.evidence_url} target="_blank" className="link mt-3 inline-block max-w-full truncate text-sm">
                The work: {m.evidence_url}
              </a>
            ) : null}
          </div>
        )}

        <dl className="space-y-4 text-sm">
          {m.review_due_at && m.state === "SUBMITTED" ? (
            <div>
              <dt className="label">Pays out automatically on</dt>
              <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2 font-medium tabular-nums">
                {when(m.review_due_at)}
                <span className="chip-amber">in {hoursLeft}h</span>
              </dd>
            </div>
          ) : (
            <div>
              <dt className="label">Deadline</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{day(m.due_at)}</dd>
            </div>
          )}
          {note ? <p className={sentBack ? "text-rose-700" : "text-ink-2"}>{note}</p> : null}
          {m.outcome && OUTCOME[m.outcome] ? <p className="font-medium text-ink">{OUTCOME[m.outcome][viewer](names)}</p> : null}
          {m.transfer_id || m.refund_id ? (
            <div className="space-y-0.5 font-mono text-[11px] text-muted">
              {m.transfer_id ? <div>Razorpay ref {m.transfer_id}</div> : null}
              {m.refund_id ? <div>Refund ref {m.refund_id}</div> : null}
            </div>
          ) : null}
        </dl>
      </div>

      {canFund || needsSignIn || canReview || canForward ? (
        <div className="mt-8 border-t border-line pt-6 sm:ml-10">
          {canFund || needsSignIn || canReview ? (
        <div className="flex flex-wrap items-start gap-3">
          {canFund ? (
            <form action={fund}>
              <input type="hidden" name="m" value={m.id} />
              <SubmitButton className={fundClass} busy={`Fund ${inr(m.amount)} · opening Razorpay…`}>Fund {inr(m.amount)} · held until delivered</SubmitButton>
            </form>
          ) : null}
          {needsSignIn ? <Link href={`/login?next=/d/${slug}`} className={fundClass}>Sign in to fund</Link> : null}

          {canReview ? (
            <div className="w-full max-w-2xl space-y-6">
              <form action={accept}>
                <input type="hidden" name="m" value={m.id} />
                <input type="hidden" name="slug" value={slug} />
                <SubmitButton className="btn h-11 px-5" busy="Paying out…">Accept and pay {names.freelancer} {inr(m.amount)}</SubmitButton>
              </form>
              <Disclosure label="Something missing? Send it back.">
                <form action={reject} className="space-y-4 text-sm">
                  <input type="hidden" name="m" value={m.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <div className="border-t border-line">
                    {checklist.map((c, i) => (
                      <label key={i} className="flex cursor-pointer items-start gap-3 border-b border-line py-2.5 transition-colors hover:bg-wash">
                        <input type="checkbox" name={`fail_${i}`} className="mt-0.5 size-4 shrink-0 accent-rose-700" /> {c}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <SubmitButton className="btn-ghost" busy="Sending back…">Send back for fixes</SubmitButton>
                    <p className="text-xs text-muted">The freelancer gets 48 hours to fix it. Sending it back twice marks it disputed.</p>
                  </div>
                </form>
              </Disclosure>
            </div>
          ) : null}
        </div>
          ) : null}

          {canForward ? (
            <form action={fastForward} className={canFund || needsSignIn || canReview ? "mt-6" : ""}>
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <SubmitButton className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-line-strong bg-paper px-3 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-60">
                Demo: fast-forward {m.state === "FUNDED" ? "past deadline" : "72h of client silence"}
              </SubmitButton>
            </form>
          ) : null}
        </div>
      ) : null}

      <ScoreChanges milestoneId={m.id} />
    </StaggerItem>
  );
}

function ScoreChanges({ milestoneId }: { milestoneId: string }) {
  const changes = scoreChanges(milestoneId).filter((c) => c.after !== c.before);
  if (!changes.length) return null;
  return (
    <div className="hairline mt-10 -mb-10 bg-wash pt-10 sm:-mb-14">
      <div className="eyebrow">Scores updated</div>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">What this outcome did to trust</h3>
      <Stagger as="ul" inView gap={0.08} className="mx-[calc(var(--rail-pad)*-1)] mt-8 grid gap-px border-t border-line bg-line sm:grid-cols-2">
        {changes.map((c) => {
          const up = c.after > c.before;
          const d = c.after - c.before;
          return (
            <StaggerItem as="li" key={c.id} className="bg-wash px-(--rail-pad) py-8 sm:last:odd:col-span-2">
              <Link href={`/u/${c.user_id}`} className="link font-semibold">{c.name}</Link>
              <p className="mt-1 text-sm text-muted">{c.reason}</p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="text-2xl font-medium text-faint tabular-nums">{c.before}</span>
                <span aria-hidden className="text-faint">→</span>
                <StableNumber
                  from={c.before}
                  to={c.after}
                  className={`text-5xl font-semibold tracking-[-0.04em] ${up ? "text-emerald-700" : "text-rose-700"}`}
                />
                <span className={up ? "chip-emerald" : "chip-rose"}>{up ? "▲ +" : "▼ "}{d}</span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
