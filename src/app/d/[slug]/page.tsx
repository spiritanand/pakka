import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow, type Milestone } from "@/lib/db";
import { getDealBySlug, getMilestones, scoreChanges } from "@/lib/deals";
import { ScoreChip } from "../../score-chip";
import { accept, fastForward, fund, reject, submit } from "../../actions";
import { CopyLink } from "./copy-link";
import { CountTo } from "./score-delta";

const inr = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const when = (t: number) => new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATE: Record<string, { label: string; tone: string; note: string }> = {
  AGREED: { label: "Awaiting funding", tone: "chip-zinc", note: "Freelancer: don't start until this says Held by Razorpay." },
  FUNDING: { label: "Confirming payment…", tone: "chip-zinc", note: "" },
  FUNDED: { label: "Held by Razorpay", tone: "chip-emerald", note: "Money is captured and on hold for the freelancer. Start work." },
  SUBMITTED: { label: "Delivered · in review", tone: "chip-amber", note: "Client has 72h to accept or reject with reasons. Silence counts as accept." },
  RELEASING: { label: "Releasing…", tone: "chip-amber", note: "" },
  RELEASED: { label: "Paid out", tone: "chip-emerald", note: "" },
  REFUNDING: { label: "Refunding…", tone: "chip-rose", note: "" },
  REFUNDED: { label: "Refunded to client", tone: "chip-rose", note: "" },
  DISPUTED: { label: "Disputed", tone: "chip-rose", note: "Rejected twice. Unresolved after 7 days → 50/50 split, both records stamped DISPUTED." },
};

const OUTCOME: Record<string, string> = {
  accepted: "Client accepted the delivery.",
  auto_released: "Client went silent for 72h after delivery → auto-released to freelancer.",
  ghosted: "Freelancer missed the deadline with nothing delivered → reversed and refunded to client.",
};

const EVENT_TEXT: Record<string, string> = {
  FUNDED: "funded a milestone (held)",
  DELIVERED: "delivered and got paid",
  ACCEPTED: "accepted and released payment",
  AUTO_RELEASED: "stayed silent; payment auto-released",
  GHOSTED: "missed the deadline with nothing delivered",
  REFUNDED: "was refunded in full",
};

const EVENT_DOT: Record<string, string> = {
  FUNDED: "bg-emerald-600",
  DELIVERED: "bg-emerald-600",
  ACCEPTED: "bg-emerald-600",
  AUTO_RELEASED: "bg-amber-500",
  GHOSTED: "bg-rose-600",
  REFUNDED: "bg-rose-600",
};

export default async function DealPage({ params }: PageProps<"/d/[slug]">) {
  const { slug } = await params;
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

  return (
    <article>
      <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div className="max-w-3xl">
          <div className="eyebrow">Protected deal</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{deal.title}</h1>
          <p className="mt-4 text-ink-2">
            <span className="font-medium text-ink tabular-nums">{inr(total)}</span> across {milestones.length} milestone
            {milestones.length === 1 ? "" : "s"} · each one held on Razorpay until it's delivered.
          </p>
        </div>
        <CopyLink />
      </header>

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
              <p className="mt-1 text-ink-2">Joins when they fund the first milestone.</p>
            </div>
          )}
        </div>
      </section>

      {milestones.map((m) => (
        <MilestoneSection key={m.id} m={m} slug={slug} isFreelancer={isFreelancer} isClient={isClient} signedIn={!!me} />
      ))}

      <section className="section">
        <h2 className="text-xl font-semibold tracking-tight">Record</h2>
        <p className="mt-1 text-[13px] text-muted">Who delivered what, when. Every line is backed by a Razorpay reference.</p>
        {events.length === 0 ? <p className="mt-6 text-sm text-muted">Nothing yet.</p> : null}
        {events.length ? (
          <ol className="mt-8 ml-1 border-l border-line">
            {events.map((e) => (
              <li key={e.id} className="relative pb-6 pl-6 last:pb-0">
                <span aria-hidden className={`absolute top-1.5 -left-[4.5px] size-2 rounded-full ring-4 ring-paper ${EVENT_DOT[e.type] ?? "bg-line-strong"}`} />
                <div className="text-sm text-ink-2">
                  <span className="font-semibold text-ink">{e.name}</span> {EVENT_TEXT[e.type]} ·{" "}
                  <span className="font-medium text-ink tabular-nums">{inr(e.amount)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-faint tabular-nums">
                  <span>{when(e.created_at)}</span>
                  {e.ref ? <span className="font-mono">{e.ref}</span> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </article>
  );
}

function MilestoneSection({ m, slug, isFreelancer, isClient, signedIn }: {
  m: Milestone; slug: string; isFreelancer: boolean; isClient: boolean; signedIn: boolean;
}) {
  const checklist = JSON.parse(m.checklist) as string[];
  const ticks = new Set<number>(m.evidence_ticks ? JSON.parse(m.evidence_ticks) : []);
  const rejected = new Set<number>(m.rejected_items ? JSON.parse(m.rejected_items) : []);
  const s = STATE[m.state];
  const canFund = m.state === "AGREED" && isClient;
  const needsSignIn = m.state === "AGREED" && !signedIn;
  const canSubmit = m.state === "FUNDED" && isFreelancer;
  const canReview = m.state === "SUBMITTED" && isClient;
  const canForward = (m.state === "FUNDED" || m.state === "SUBMITTED") && signedIn;

  return (
    <section className="section">
      <div className="grid grid-cols-[1.25rem_1fr] items-baseline gap-x-5 gap-y-3 sm:grid-cols-[1.25rem_1fr_auto]">
        <span className="font-mono text-sm text-faint tabular-nums">{String(m.idx + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{m.title}</h2>
          {m.round > 1 ? <div className="mt-1 text-[13px] text-muted">Revision {m.round - 1}</div> : null}
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-3 sm:col-start-3">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{inr(m.amount)}</span>
          <span className={s.tone}><span className="dot" />{s.label}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-10 sm:pl-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="label">"Delivered" means — agreed up front</h3>
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
              Evidence: {m.evidence_url}
            </a>
          ) : null}
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="label">Deadline</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{when(m.due_at)}</dd>
          </div>
          {m.review_due_at && m.state === "SUBMITTED" ? (
            <div>
              <dt className="label">Auto-release if client stays silent</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{when(m.review_due_at)}</dd>
            </div>
          ) : null}
          {s.note ? <p className="text-ink-2">{s.note}</p> : null}
          {m.outcome ? <p className="font-medium text-ink">{OUTCOME[m.outcome]}</p> : null}
          {m.transfer_id || m.refund_id ? (
            <div className="space-y-0.5 font-mono text-xs text-faint">
              {m.transfer_id ? <div>transfer {m.transfer_id}</div> : null}
              {m.refund_id ? <div>refund {m.refund_id}</div> : null}
            </div>
          ) : null}
        </dl>
      </div>

      {canFund || needsSignIn || canSubmit || canReview || canForward ? (
        <div className="mt-8 flex flex-wrap items-start gap-3 border-t border-line pt-6 sm:ml-10">
          {canFund ? (
            <form action={fund}>
              <input type="hidden" name="m" value={m.id} />
              <button className="btn h-11 px-5">Fund {inr(m.amount)} · held until delivered</button>
            </form>
          ) : null}
          {needsSignIn ? <a href={`/login?next=/d/${slug}`} className="btn h-11 px-5">Sign in to fund</a> : null}

          {canSubmit ? (
            <form action={submit} className="w-full max-w-2xl space-y-4">
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <label className="block space-y-1.5">
                <span className="label block">Where's the work?</span>
                <input className="input" name="url" placeholder="Link to the work (staging URL, Figma, Drive…)" required />
              </label>
              <fieldset>
                <legend className="label">Tick each item you delivered</legend>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  {checklist.map((c, i) => (
                    <label key={i} className="flex items-center gap-2.5">
                      <input type="checkbox" name={`tick_${i}`} className="size-4" required /> {c}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="btn">Mark delivered</button>
            </form>
          ) : null}

          {canReview ? (
            <div className="flex w-full flex-wrap items-start gap-x-8 gap-y-6">
              <form action={accept}>
                <input type="hidden" name="m" value={m.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="btn h-11 px-5">Accept & release {inr(m.amount)}</button>
              </form>
              <form action={reject} className="min-w-64 flex-1 space-y-3 border-line text-sm sm:border-l sm:pl-8">
                <input type="hidden" name="m" value={m.id} />
                <input type="hidden" name="slug" value={slug} />
                <div className="label">Not delivered? Tick what's missing</div>
                <div className="flex flex-col gap-2">
                  {checklist.map((c, i) => (
                    <label key={i} className="flex items-center gap-2.5">
                      <input type="checkbox" name={`fail_${i}`} className="size-4" /> {c}
                    </label>
                  ))}
                </div>
                <button className="btn-ghost">Reject with reasons</button>
              </form>
            </div>
          ) : null}

          {canForward ? (
            <form action={fastForward} className="ml-auto">
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-line-strong bg-paper px-3 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink">
                ⏩ Demo: fast-forward {m.state === "FUNDED" ? "past deadline" : "72h of client silence"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      <ScoreChanges milestoneId={m.id} />
    </section>
  );
}

function ScoreChanges({ milestoneId }: { milestoneId: string }) {
  const changes = scoreChanges(milestoneId).filter((c) => c.after !== c.before);
  if (!changes.length) return null;
  return (
    <div className="hairline mt-10 -mb-10 bg-wash pt-10 sm:-mb-14">
      <div className="eyebrow">Trust, updated</div>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">What this outcome did to trust</h3>
      <ul className="mx-[calc(var(--rail-pad)*-1)] mt-8 grid gap-px border-t border-line bg-line sm:grid-cols-2">
        {changes.map((c) => {
          const up = c.after > c.before;
          const d = c.after - c.before;
          return (
            <li key={c.id} className="bg-wash px-(--rail-pad) py-8 sm:last:odd:col-span-2">
              <a href={`/u/${c.user_id}`} className="link font-semibold">{c.name}</a>
              <p className="mt-1 text-sm text-muted">{c.reason}</p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="text-2xl font-medium text-faint tabular-nums">{c.before}</span>
                <span aria-hidden className="text-faint">→</span>
                <span className={`text-5xl font-semibold tracking-[-0.04em] ${up ? "text-emerald-700" : "text-rose-700"}`}>
                  <CountTo from={c.before} to={c.after} />
                </span>
                <span className={up ? "chip-emerald" : "chip-rose"}>{up ? "▲ +" : "▼ "}{d}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
