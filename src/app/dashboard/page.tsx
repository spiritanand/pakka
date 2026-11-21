import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, type Deal } from "@/lib/db";
import { ScoreChip } from "../score-chip";
import { SeedButton } from "../seed-button";

const day = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const deals = db
    .prepare(`select * from deals where freelancer_id = ? or client_id = ? order by created_at desc`)
    .all(u.id, u.id) as Deal[];
  const open = db.prepare(`select * from deals where client_id is null and freelancer_id != ? order by created_at desc limit 5`).all(u.id) as Deal[];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreChip userId={u.id} name={u.name} role="Your score" size="lg" />
        <div className="flex flex-wrap items-center gap-3">
          <SeedButton />
          <Link href="/new" className="btn">New protected deal</Link>
        </div>
      </header>

      <section className="section">
        <DealList
          title="Your deals"
          empty="No deals yet. Create one and send the link to your client on WhatsApp."
          deals={deals}
          role={(d) => (d.freelancer_id === u.id ? "You're the freelancer" : "You're the client")}
        />
      </section>

      {open.length ? (
        <section className="section">
          <DealList title="Open links waiting for a client" deals={open} role={() => "Shared with you"} />
        </section>
      ) : null}
    </div>
  );
}

function DealList({ title, deals, role, empty }: { title: string; deals: Deal[]; role: (d: Deal) => string; empty?: string }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <span className="text-[13px] text-muted tabular-nums">{deals.length}</span>
      </div>
      {deals.length === 0 && empty ? <p className="mt-4 max-w-prose text-ink-2">{empty}</p> : null}
      {deals.length ? (
        <ul className="mt-6 border-t border-line">
          {deals.map((d) => (
            <li key={d.id} className="border-b border-line">
              <Link
                href={`/d/${d.slug}`}
                prefetch={true}
                className="group -mx-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-sm px-3 py-4 transition-colors hover:bg-wash"
              >
                <span className="font-medium text-ink">{d.title}</span>
                <span className="flex items-center gap-4 text-[13px] text-muted">
                  <span>{role(d)}</span>
                  <span className="tabular-nums text-faint">{day(d.created_at)}</span>
                  <span aria-hidden className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
