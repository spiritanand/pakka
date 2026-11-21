import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageCircle, SquareArrowOutUpRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Tip, siteOrigin, whatsappHref } from "../d/[slug]/share";
import { currentUser } from "@/lib/auth";
import { db, type Deal } from "@/lib/db";
import { createdByClient, getMilestones } from "@/lib/deals";
import { ScoreChip } from "../score-chip";
import { SeedButton } from "../seed-button";
import { day, firstName, inr } from "../format";

export const metadata: Metadata = { title: "Your deals" };

const SHORT: Record<string, string> = {
  AGREED: "not funded",
  FUNDING: "confirming",
  FUNDED: "held",
  SUBMITTED: "in review",
  RELEASING: "paying out",
  RELEASED: "paid",
  REFUNDING: "refunding",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
};
const ORDER = Object.keys(SHORT);

type Row = Deal & { total: number; states: string; freelancer_name?: string | null; client_name?: string | null };
type Action = { text: string; tone: string };

function actionFor(d: Row, userId: string): Action | null {
  const ms = getMilestones(d.id);
  const nothingFunded = ms.every((m) => m.state === "AGREED");
  if (d.client_id === userId) {
    const review = ms.find((m) => m.state === "SUBMITTED" && m.review_due_at);
    if (review) return { text: `Review · ${Math.max(0, Math.ceil((review.review_due_at! - Date.now()) / 3_600_000))}h left`, tone: "chip-amber" };
    if (createdByClient(d) && nothingFunded) return d.freelancer_id ? { text: "Fund milestone 1", tone: "chip-emerald" } : { text: "Send the link", tone: "chip-zinc" };
  }
  if (d.freelancer_id === userId) {
    const held = ms.find((m) => m.state === "FUNDED");
    if (held) return { text: `Deliver by ${day(held.due_at)}`, tone: "chip-emerald" };
    if (nothingFunded && !createdByClient(d)) return { text: "Send the link", tone: "chip-zinc" };
  }
  return null;
}

function roleOf(d: Row, userId: string) {
  if (d.freelancer_id === userId) return d.client_name ? `For ${firstName(d.client_name)}` : "No client yet";
  if (!d.freelancer_name) return "Waiting for a freelancer";
  return `${createdByClient(d) ? "With" : "From"} ${firstName(d.freelancer_name)}`;
}

function summary(states: string) {
  const counts = new Map<string, number>();
  for (const s of states.split(",")) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts]
    .sort(([a], [b]) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .map(([s, n]) => ({ s, text: `${n} ${SHORT[s] ?? s.toLowerCase()}` }));
}

const withMilestones = `select d.*, sum(m.amount) as total, group_concat(m.state) as states, f.name as freelancer_name, c.name as client_name
  from deals d join milestones m on m.deal_id = d.id left join user f on f.id = d.freelancer_id left join user c on c.id = d.client_id`;

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login?mode=signin&next=/dashboard");
  const deals = db
    .prepare(`${withMilestones} where d.freelancer_id = ? or d.client_id = ? group by d.id order by d.created_at desc`)
    .all(u.id, u.id) as Row[];
  const actions = new Map(deals.map((d) => [d.id, actionFor(d, u.id)]));
  deals.sort((a, b) => Number(!!actions.get(b.id)) - Number(!!actions.get(a.id)));
  const demoViewer = u.email.endsWith("@pakka.demo");
  const open = db
    .prepare(
      `select d.*, sum(m.amount) as total, group_concat(m.state) as states, f.name as freelancer_name
       from deals d join milestones m on m.deal_id = d.id join user f on f.id = d.freelancer_id
       where d.client_id is null and d.freelancer_id != ? and f.email like '%@pakka.demo' group by d.id order by d.created_at desc limit 5`,
    )
    .all(u.id) as Row[];
  const waiting = demoViewer && !deals.length && open.length > 0;
  const origin = await siteOrigin();

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreChip userId={u.id} name={u.name} role="Your score" size="lg" />
        <Link href="/new" className={waiting ? "btn-ghost" : "btn"}>New deal</Link>
      </header>

      {waiting ? null : (
        <section className="section">
          <ListHead title="Your deals" count={deals.length} />
          {deals.length ? (
            <DealList origin={origin} viewer={u.id} deals={deals} role={(d) => roleOf(d, u.id)} action={(d) => actions.get(d.id) ?? null} />
          ) : (
            <p className="mt-4 max-w-md text-ink-2">
              No deals yet. Create one and send the link to your client on WhatsApp.
            </p>
          )}
        </section>
      )}

      {open.length ? (
        <section className="section">
          <ListHead title={waiting ? "Waiting for you" : "Demo deals you can fund"} count={open.length} />
          <DealList
            origin={origin}
            viewer={u.id}
            deals={open}
            role={() => "Open to fund"}
            meta={(d) => {
              const n = d.states.split(",").length;
              return `from ${firstName(d.freelancer_name ?? "")} · ${n} milestone${n === 1 ? "" : "s"}`;
            }}
          />
        </section>
      ) : null}

      <div className="flex justify-end">
        <SeedButton />
      </div>
    </div>
  );
}

function ListHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-heading">{title}</h2>
      <span className="text-meta text-muted tabular-nums">{count}</span>
    </div>
  );
}

const ACTION = "grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink";

function DealList({ deals, role, meta, action, origin, viewer }: {
  deals: Row[]; role: (d: Row) => string; meta?: (d: Row) => string; action?: (d: Row) => Action | null; origin: string; viewer: string;
}) {
  return (
    <ul className="mt-4 border-t border-line">
      {deals.map((d) => {
        const act = action?.(d);
        const detail = meta ? meta(d) : summary(d.states).map((p) => p.text).join(" · ");
        return (
          <li key={d.id} className="border-b border-line">
            <div className="group relative -mx-3 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-md px-3 py-4 transition-colors hover:bg-wash sm:gap-x-6">
              <span className="min-w-0">
                <Link href={`/d/${d.slug}`} className="line-clamp-2 font-medium break-words text-ink after:absolute after:inset-0 after:rounded-md sm:line-clamp-1">
                  {d.title}
                </Link>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted tabular-nums">
                  {act ? <span className={act.tone}>{act.text}</span> : null}
                  <span>{role(d)} · {detail}</span>
                </span>
              </span>
              <span className="flex items-center gap-3 sm:gap-4">
                <span className="relative z-10 hidden items-center gap-0.5 transition-opacity sm:flex pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                  <Tip label="Copy link">
                    <CopyButton value={`/d/${d.slug}`} href variant="icon" label="Copy link" className="hover:bg-paper!" />
                  </Tip>
                  <Tip label="Share on WhatsApp">
                    <a href={whatsappHref(`${origin}/d/${d.slug}`, d.title, d.client_id === viewer)} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={ACTION}>
                      <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
                    </a>
                  </Tip>
                  <Tip label="Open in new tab">
                    <Link href={`/d/${d.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab" className={ACTION}>
                      <SquareArrowOutUpRight size={16} strokeWidth={1.75} aria-hidden />
                    </Link>
                  </Tip>
                </span>
                <span className="font-medium text-ink tabular-nums">{inr(d.total)}</span>
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden className="text-muted transition-colors group-hover:text-emerald-700" />
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
