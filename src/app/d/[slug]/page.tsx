import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getUser, type EventRow, type Milestone } from "@/lib/db";
import { getDealBySlug, getMilestones } from "@/lib/deals";
import { ScoreChip } from "../../score-chip";
import { accept, fastForward, fund, reject, submit } from "../../actions";
import { CopyLink } from "./copy-link";

const inr = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const when = (t: number) => new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATE: Record<string, { label: string; tone: string; note: string }> = {
  AGREED: { label: "Awaiting funding", tone: "bg-zinc-100 text-zinc-700", note: "Freelancer: don't start until this says HELD." },
  FUNDING: { label: "Confirming payment…", tone: "bg-zinc-100 text-zinc-700", note: "" },
  FUNDED: { label: "Held by Razorpay", tone: "bg-sky-100 text-sky-800", note: "Money is captured and on hold for the freelancer. Start work." },
  SUBMITTED: { label: "Delivered · in review", tone: "bg-violet-100 text-violet-800", note: "Client has 72h to accept or reject with reasons. Silence = accept." },
  RELEASING: { label: "Releasing…", tone: "bg-violet-100 text-violet-800", note: "" },
  RELEASED: { label: "Paid out", tone: "bg-emerald-100 text-emerald-800", note: "" },
  REFUNDING: { label: "Refunding…", tone: "bg-rose-100 text-rose-800", note: "" },
  REFUNDED: { label: "Refunded to client", tone: "bg-rose-100 text-rose-800", note: "" },
  DISPUTED: { label: "Disputed", tone: "bg-orange-100 text-orange-800", note: "Rejected twice. Unresolved after 7 days → 50/50 split, both records stamped DISPUTED." },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label">Protected deal</div>
          <h1 className="text-3xl font-bold tracking-tight">{deal.title}</h1>
        </div>
        <CopyLink />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ScoreChip userId={freelancer.id} name={freelancer.name} role="Freelancer" />
        {client ? (
          <ScoreChip userId={client.id} name={client.name} role="Client" />
        ) : (
          <div className="flex items-center rounded-2xl border border-dashed border-black/20 px-4 py-3 text-sm text-black/60">
            Client joins when they fund the first milestone.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {milestones.map((m) => (
          <MilestoneCard key={m.id} m={m} slug={slug} isFreelancer={isFreelancer} isClient={isClient} signedIn={!!me} />
        ))}
      </div>

      <section className="card">
        <div className="label mb-3">Record · who delivered what, when</div>
        {events.length === 0 ? <p className="text-sm text-black/50">Nothing yet.</p> : null}
        <ul className="space-y-2 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-mono text-xs text-black/40">{when(e.created_at)}</span>
              <b>{e.name}</b> {EVENT_TEXT[e.type]} · {inr(e.amount)}
              {e.ref ? <span className="font-mono text-xs text-black/40">{e.ref}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MilestoneCard({ m, slug, isFreelancer, isClient, signedIn }: {
  m: Milestone; slug: string; isFreelancer: boolean; isClient: boolean; signedIn: boolean;
}) {
  const checklist = JSON.parse(m.checklist) as string[];
  const ticks = new Set<number>(m.evidence_ticks ? JSON.parse(m.evidence_ticks) : []);
  const rejected = new Set<number>(m.rejected_items ? JSON.parse(m.rejected_items) : []);
  const s = STATE[m.state];
  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="label">Milestone {m.idx + 1}{m.round > 1 ? ` · revision ${m.round - 1}` : ""}</div>
          <div className="text-xl font-semibold">{m.title}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">{inr(m.amount)}</div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.tone}`}>{s.label}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="label mb-2">"Delivered" means — agreed up front</div>
          <ul className="space-y-1 text-sm">
            {checklist.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span>{rejected.has(i) ? "✗" : ticks.has(i) ? "✓" : "○"}</span>
                <span className={rejected.has(i) ? "text-rose-700" : ""}>{c}</span>
              </li>
            ))}
          </ul>
          {m.evidence_url ? (
            <a href={m.evidence_url} target="_blank" className="mt-2 inline-block text-sm text-sky-700 underline">
              Evidence: {m.evidence_url}
            </a>
          ) : null}
        </div>
        <div className="space-y-1 text-sm text-black/70">
          <div>Deadline: <b>{when(m.due_at)}</b></div>
          {m.review_due_at && m.state === "SUBMITTED" ? <div>Auto-release at: <b>{when(m.review_due_at)}</b></div> : null}
          {s.note ? <div>{s.note}</div> : null}
          {m.outcome ? <div className="font-medium text-black">{OUTCOME[m.outcome]}</div> : null}
          {m.transfer_id ? <div className="font-mono text-xs text-black/40">transfer {m.transfer_id}</div> : null}
          {m.refund_id ? <div className="font-mono text-xs text-black/40">refund {m.refund_id}</div> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-black/5 pt-4">
        {m.state === "AGREED" && isClient ? (
          <form action={fund}>
            <input type="hidden" name="m" value={m.id} />
            <button className="btn">Fund {inr(m.amount)} · held until delivered</button>
          </form>
        ) : null}
        {m.state === "AGREED" && !signedIn ? <a href="/" className="btn">Sign in to fund</a> : null}

        {m.state === "FUNDED" && isFreelancer ? (
          <form action={submit} className="w-full space-y-2">
            <input type="hidden" name="m" value={m.id} />
            <input type="hidden" name="slug" value={slug} />
            <input className="input" name="url" placeholder="Link to the work (staging URL, Figma, Drive…)" required />
            <div className="flex flex-wrap gap-3 text-sm">
              {checklist.map((c, i) => (
                <label key={i} className="flex items-center gap-1">
                  <input type="checkbox" name={`tick_${i}`} required /> {c}
                </label>
              ))}
            </div>
            <button className="btn">Mark delivered</button>
          </form>
        ) : null}

        {m.state === "SUBMITTED" && isClient ? (
          <div className="flex w-full flex-wrap items-start gap-3">
            <form action={accept}>
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <button className="btn bg-emerald-600 hover:bg-emerald-700">Accept & release {inr(m.amount)}</button>
            </form>
            <form action={reject} className="flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="m" value={m.id} />
              <input type="hidden" name="slug" value={slug} />
              <span className="text-black/60">Not delivered:</span>
              {checklist.map((c, i) => (
                <label key={i} className="flex items-center gap-1"><input type="checkbox" name={`fail_${i}`} /> {c}</label>
              ))}
              <button className="btn-ghost">Reject with reasons</button>
            </form>
          </div>
        ) : null}

        {(m.state === "FUNDED" || m.state === "SUBMITTED") && signedIn ? (
          <form action={fastForward} className="ml-auto">
            <input type="hidden" name="m" value={m.id} />
            <input type="hidden" name="slug" value={slug} />
            <button className="btn-ghost border-dashed text-xs">
              ⏩ Demo: fast-forward {m.state === "FUNDED" ? "past deadline" : "72h of client silence"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
