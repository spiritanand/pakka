import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, type Deal } from "@/lib/db";
import { ScoreChip } from "../score-chip";
import { SeedButton } from "../seed-button";

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const deals = db
    .prepare(`select * from deals where freelancer_id = ? or client_id = ? order by created_at desc`)
    .all(u.id, u.id) as Deal[];
  const open = db.prepare(`select * from deals where client_id is null and freelancer_id != ? order by created_at desc limit 5`).all(u.id) as Deal[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ScoreChip userId={u.id} name={u.name} role="Your score" />
        <div className="flex gap-2">
          <Link href="/new" className="btn">New protected deal</Link>
          <SeedButton />
        </div>
      </div>
      <section className="card">
        <div className="label mb-3">Your deals</div>
        {deals.length === 0 ? <p className="text-black/60">No deals yet.</p> : null}
        <ul className="divide-y divide-black/5">
          {[...deals, ...open].map((d) => (
            <li key={d.id} className="py-2">
              <Link href={`/d/${d.slug}`} className="font-medium hover:underline">{d.title}</Link>
              <span className="ml-2 text-xs text-black/50">
                {d.freelancer_id === u.id ? "you're the freelancer" : d.client_id === u.id ? "you're the client" : "shared with you"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
