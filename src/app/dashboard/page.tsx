import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageCircle, SquareArrowOutUpRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Tip, siteOrigin, whatsappHref } from "../d/[slug]/share";
import { currentUser } from "@/lib/auth";
import { db, type Deal } from "@/lib/db";
import { Stagger, StaggerItem } from "@/components/motion";
import { ScoreChip } from "../score-chip";
import { SeedButton } from "../seed-button";
import { firstName, inr } from "../format";

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

type Row = Deal & { total: number; states: string; freelancer_name?: string };

function summary(states: string) {
  const counts = new Map<string, number>();
  for (const s of states.split(",")) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts]
    .sort(([a], [b]) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .map(([s, n]) => ({ s, text: `${n} ${SHORT[s] ?? s.toLowerCase()}` }));
}

const TONE: Record<string, string> = {
  FUNDED: "text-emerald-700",
  SUBMITTED: "text-amber-700",
  RELEASED: "text-ink-2",
  DISPUTED: "text-rose-700",
  REFUNDED: "text-rose-700",
};

const withMilestones = `select d.*, sum(m.amount) as total, group_concat(m.state) as states
  from deals d join milestones m on m.deal_id = d.id`;

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const deals = db
    .prepare(`${withMilestones} where d.freelancer_id = ? or d.client_id = ? group by d.id order by d.created_at desc`)
    .all(u.id, u.id) as Row[];
  const open = db
    .prepare(
      `select d.*, sum(m.amount) as total, group_concat(m.state) as states, f.name as freelancer_name
       from deals d join milestones m on m.deal_id = d.id join user f on f.id = d.freelancer_id
       where d.client_id is null and d.freelancer_id != ? group by d.id order by d.created_at desc limit 5`,
    )
    .all(u.id) as Row[];
  const waiting = !deals.length && open.length > 0;
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
            <DealList origin={origin} deals={deals} role={(d) => (d.freelancer_id === u.id ? "You're the freelancer" : "You're the client")} />
          ) : (
            <p className="mt-6 max-w-md border-y border-line py-8 text-ink-2">
              No deals yet. Create one and send the link to your client on WhatsApp.
            </p>
          )}
        </section>
      )}

      {open.length ? (
        <section className="section">
          <ListHead title={waiting ? "Waiting for you" : "Open links"} count={open.length} tag={waiting ? undefined : "demo"} />
          <DealList
            origin={origin}
            deals={open}
            role={() => "Open to fund"}
            meta={(d) => {
              const n = d.states.split(",").length;
              return `from ${firstName(d.freelancer_name ?? "")} · ${n} milestone${n === 1 ? "" : "s"}`;
            }}
          />
        </section>
      ) : null}

      <div className="flex justify-end pt-6">
        <SeedButton />
      </div>
    </div>
  );
}

function ListHead({ title, count, tag }: { title: string; count: number; tag?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
        {title}
        {tag ? <span className="chip-zinc font-normal tracking-normal">{tag}</span> : null}
      </h2>
      <span className="text-[13px] text-muted tabular-nums">{count}</span>
    </div>
  );
}

const ACTION = "grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink";

function DealList({ deals, role, meta, origin }: { deals: Row[]; role: (d: Row) => string; meta?: (d: Row) => string; origin: string }) {
  return (
    <Stagger as="ul" className="mt-6 border-t border-line">
      {deals.map((d) => (
        <StaggerItem as="li" key={d.id} className="border-b border-line">
          <div className="group relative -mx-3 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-sm px-3 py-4 transition-colors hover:bg-wash sm:gap-x-6">
            <span className="min-w-0">
              <Link href={`/d/${d.slug}`} className="block truncate font-medium text-ink after:absolute after:inset-0 after:rounded-sm">
                {d.title}
              </Link>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="chip-zinc">{role(d)}</span>
                <span className="tabular-nums">
                  {meta
                    ? meta(d)
                    : summary(d.states).map((p, i) => (
                        <span key={p.s}>
                          {i ? <span className="text-faint"> · </span> : null}
                          <span className={TONE[p.s] ?? ""}>{p.text}</span>
                        </span>
                      ))}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-3 sm:gap-4">
              <span className="relative z-10 flex items-center gap-0.5 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                <Tip label="Copy link">
                  <CopyButton value={`/d/${d.slug}`} href variant="icon" label="Copy link" copiedLabel="Copied" className="hover:bg-paper!" />
                </Tip>
                <Tip label="Share on WhatsApp">
                  <a href={whatsappHref(`${origin}/d/${d.slug}`, d.title)} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={ACTION}>
                    <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
                  </a>
                </Tip>
                <Tip label="Open in new tab">
                  <Link href={`/d/${d.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab" className={ACTION}>
                    <SquareArrowOutUpRight size={16} strokeWidth={1.75} aria-hidden />
                  </Link>
                </Tip>
              </span>
              <span className="font-semibold text-ink tabular-nums">{inr(d.total)}</span>
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden className="text-faint transition-colors group-hover:text-emerald-700" />
            </span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
