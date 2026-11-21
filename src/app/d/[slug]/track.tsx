import { Check, ChevronRight, CornerUpLeft, Undo2, X } from "lucide-react";
import type { ActivityRow, EventRow, Milestone } from "@/lib/db";
import { REVIEW_WINDOW } from "@/lib/deals";
import { clock, day, firstName, inr } from "../../format";

export type Named<T> = T & { name: string };
type Tone = "done" | "current" | "future" | "fail";
type Proof = { label: string; ref: string };
type Step = {
  title: string;
  tone: Tone;
  icon?: "back" | "x" | "refund";
  at?: number;
  due?: boolean;
  note?: string;
  noteTone?: "rose";
  proof?: Proof[];
};

const hoursLeft = (t: number) => Math.max(0, Math.ceil((t - Date.now()) / 3_600_000));
const DAY = 86_400_000;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function trackSteps({ m, events, activity, client, freelancer, createdAt }: {
  m: Milestone;
  events: Named<EventRow>[];
  activity: Named<ActivityRow>[];
  client: string | null;
  freelancer: string | null;
  createdAt: number;
}): Step[] {
  const s = m.state as string;
  const ev = (type: string) => events.find((e) => e.milestone_id === m.id && e.type === type);
  const mine = activity.filter((a) => a.milestone_id === m.id).sort((a, b) => a.created_at - b.created_at);
  const deliveries = mine.filter((a) => a.type === "SUBMITTED");
  const sentBack = mine.filter((a) => a.type === "SENT_BACK");
  const lastBack = sentBack.at(-1);
  const checklist = JSON.parse(m.checklist) as string[];
  const missing = (m.rejected_items ? (JSON.parse(m.rejected_items) as number[]) : []).map((i) => checklist[i]).filter(Boolean);
  const c = client ?? "The client";
  const f = freelancer ?? "the freelancer";
  const who = (e: { name: string } | undefined, fallback: string) => (e ? firstName(e.name) : fallback);
  const funded = ev("FUNDED");
  const unfunded = s === "AGREED" || s === "FUNDING";
  const refunded = s === "REFUNDED" || s === "REFUNDING";
  const delivered = ["SUBMITTED", "RELEASING", "RELEASED", "DISPUTED"].includes(s);

  const fund: Step = unfunded
    ? s === "FUNDING"
      ? { title: "Confirming payment", tone: "current" }
      : { title: "Funded", tone: "future", note: client ? `${inr(m.amount)} from ${client}` : `${inr(m.amount)} up front` }
    : {
        title: `${who(funded, c)} funded`,
        tone: "done",
        at: funded?.created_at,
        proof: [{ label: "Razorpay payment", ref: funded?.ref ?? m.payment_id ?? "" }, { label: "Transfer on hold", ref: m.transfer_id ?? "" }]
          .filter((p) => p.ref),
      };

  const days = Math.max(1, Math.round((m.due_at - createdAt) / DAY));
  const lastDelivery = deliveries.at(-1);
  const deliveredAt = lastDelivery?.created_at ?? (m.review_due_at ? m.review_due_at - REVIEW_WINDOW : undefined);
  const deliver: Step = unfunded
    ? { title: "Delivered", tone: "future", note: `${plural(days, "day")} after funding` }
    : refunded
      ? { title: "Missed deadline", tone: "fail", icon: "x", at: m.due_at, note: "Nothing delivered" }
      : delivered
        ? {
            title: `${who(lastDelivery, f)} delivered${deliveries.length > 1 ? " again" : ""}`,
            tone: "done",
            at: deliveredAt,
          }
        : missing.length
          ? {
              title: `${f} fixes ${plural(missing.length, "item")}`,
              tone: "current",
              at: m.due_at,
              due: true,
              note: lastBack ? `Sent back by ${firstName(lastBack.name)} on ${day(lastBack.created_at)}` : "Sent back",
              noteTone: "rose",
            }
          : { title: `${f} delivers`, tone: "current", at: m.due_at, due: true };

  const accepted = ev("ACCEPTED");
  const auto = ev("AUTO_RELEASED");
  const review: Step | null = refunded
    ? null
    : s === "RELEASED" || s === "RELEASING"
      ? m.outcome === "auto_released"
        ? { title: "Auto-released after 72h", tone: "done", at: auto?.created_at, note: `No reply from ${c}` }
        : { title: `${who(accepted, c)} accepted`, tone: "done", at: accepted?.created_at }
      : s === "SUBMITTED"
        ? { title: `${c} reviews`, tone: "current", at: m.review_due_at ?? undefined, due: true, note: "Paid automatically after that" }
        : s === "DISPUTED"
          ? {
              title: sentBack.length > 1 ? "Sent back twice" : "Sent back",
              tone: "fail",
              icon: "back",
              at: lastBack?.created_at,
              note: missing.length ? `Missing: ${missing.join(", ")}` : undefined,
              noteTone: "rose",
            }
          : { title: "Accepted", tone: "future", note: "Within 72h of delivery" };

  const paid = ev("DELIVERED");
  const refund = ev("REFUNDED");
  const payout: Step = refunded
    ? s === "REFUNDING"
      ? { title: `Refunding ${c}`, tone: "current" }
      : {
          title: `Refunded to ${who(refund, c)}`,
          tone: "fail",
          icon: "refund",
          at: refund?.created_at,
          note: inr(m.amount),
          proof: m.refund_id ? [{ label: "Razorpay refund", ref: m.refund_id }] : undefined,
        }
    : s === "RELEASED"
      ? {
          title: `Paid to ${who(paid, f)}`,
          tone: "done",
          at: paid?.created_at,
          note: inr(m.amount),
          proof: m.transfer_id ? [{ label: "Razorpay transfer", ref: m.transfer_id }] : undefined,
        }
      : s === "RELEASING"
        ? { title: `Paying ${f}`, tone: "current" }
        : { title: "Paid", tone: "future", note: s === "DISPUTED" ? "On hold with Razorpay" : `${inr(m.amount)} to ${f}` };

  return [fund, deliver, ...(review ? [review] : []), payout];
}

const NODE: Record<Tone, string> = {
  done: "bg-emerald-600 text-white",
  current: "border-[1.5px] border-emerald-600 bg-paper",
  future: "border border-line-strong bg-paper",
  fail: "bg-rose-600 text-white",
};

const LINE: Record<Tone, string> = {
  done: "bg-emerald-500",
  current: "bg-emerald-500",
  future: "bg-line",
  fail: "bg-rose-300",
};

const ICON = { back: CornerUpLeft, x: X, refund: Undo2 };

export function DeliveryTrack({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol aria-label={label} className={`grid ${steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      {steps.map((step, i) => {
        const next = steps[i + 1];
        const Icon = step.tone === "done" ? Check : step.icon ? ICON[step.icon] : null;
        return (
          <li key={i} className="relative pb-7 pl-10 last:pb-0 md:pr-6 md:pb-0 md:pl-0" aria-current={step.tone === "current" ? "step" : undefined}>
            {next ? (
              <span
                aria-hidden
                className={`absolute top-[21px] bottom-0 left-[10px] w-px md:top-[10px] md:right-0 md:bottom-auto md:left-[21px] md:h-px md:w-auto ${LINE[next.tone]}`}
              />
            ) : null}
            <span aria-hidden className={`absolute top-0 left-0 grid size-[21px] place-items-center rounded-full md:static ${NODE[step.tone]}`}>
              {Icon ? <Icon size={12} strokeWidth={2.5} /> : step.tone === "current" ? <span className="size-[7px] rounded-full bg-emerald-600" /> : null}
            </span>
            <div className="min-w-0 md:mt-3.5">
              <p className={`text-sm leading-[21px] font-medium ${step.tone === "future" ? "text-ink-2" : step.tone === "fail" ? "text-rose-800" : "text-ink"}`}>
                {step.title}
              </p>
              {step.at ? (
                <p className="mt-0.5 text-meta text-muted tabular-nums">
                  {step.due ? "by " : ""}
                  {day(step.at)} <span className="font-mono text-xs">{clock(step.at)}</span>
                  {step.due && step.at > Date.now() ? <span> · {hoursLeft(step.at)}h left</span> : null}
                </p>
              ) : null}
              {step.note ? (
                <p className={`mt-0.5 text-meta ${step.noteTone === "rose" ? "text-rose-700" : "text-muted"} ${step.tone === "future" ? "" : "tabular-nums"}`}>
                  {step.note}
                </p>
              ) : null}
              {step.proof?.length ? <ProofList proof={step.proof} /> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ProofList({ proof }: { proof: Proof[] }) {
  return (
    <details className="group mt-2 text-meta">
      <summary
        title={proof.map((p) => `${p.label}: ${p.ref}`).join("\n")}
        className="inline-flex list-none items-center gap-1 rounded-sm text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden"
      >
        <ChevronRight size={14} strokeWidth={1.75} aria-hidden className="transition-transform group-open:rotate-90" />
        Proof
      </summary>
      <dl className="mt-1.5 space-y-1.5 border-l border-line pl-3">
        {proof.map((p) => (
          <div key={p.ref}>
            <dt className="text-xs text-muted">{p.label}</dt>
            <dd className="font-mono text-xs break-all text-ink-2 select-all">{p.ref}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
