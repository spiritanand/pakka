import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, type Deal } from "@/lib/db";
import { ScoreChip } from "./score-chip";
import { signIn, signUp } from "./actions";
import { SeedButton } from "./seed-button";

const PERSONAS = [
  ["meera", "Meera · client"],
  ["rohan", "Rohan · freelancer"],
  ["priya", "Priya · voucher"],
  ["arjun", "Arjun"],
];

export default async function Home() {
  const u = await currentUser();
  if (!u) {
    return (
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="py-6">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Whoever moves first<br />is exposed.
          </h1>
          <p className="mt-4 max-w-md text-lg text-black/70">
            Pakka is a pay link that <b>holds the money on Razorpay</b> until the work lands — and turns every finished
            deal into a <b>0–1000 trust score</b> both sides carry anywhere.
          </p>
          <ul className="mt-6 space-y-2 text-black/80">
            <li>• Freelancer goes silent past the deadline → client is refunded.</li>
            <li>• Client goes silent after delivery → freelancer is paid in 72h.</li>
            <li>• Every outcome moves both scores — and the scores of whoever vouched.</li>
          </ul>
          <div className="mt-8">
            <div className="label mb-2">Demo personas</div>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map(([k, label]) => (
                <form key={k} action={signIn}>
                  <input type="hidden" name="email" value={`${k}@pakka.demo`} />
                  <input type="hidden" name="password" value="pakka1234" />
                  <button className="btn-ghost">{label}</button>
                </form>
              ))}
            </div>
            <div className="mt-3"><SeedButton /></div>
          </div>
        </section>
        <section className="space-y-4">
          <form action={signIn} className="card space-y-3">
            <div className="font-semibold">Sign in</div>
            <input className="input" name="email" type="email" placeholder="Email" required />
            <input className="input" name="password" type="password" placeholder="Password" required />
            <button className="btn w-full">Sign in</button>
          </form>
          <form action={signUp} className="card space-y-3">
            <div className="font-semibold">Create account</div>
            <input className="input" name="name" placeholder="Name" required />
            <input className="input" name="email" type="email" placeholder="Email" required />
            <input className="input" name="password" type="password" placeholder="Password (6+)" required />
            <input className="input" name="phone" placeholder="Phone" />
            <div className="grid grid-cols-2 gap-2">
              <input className="input uppercase" name="pan" placeholder="PAN" />
              <input className="input uppercase" name="gstin" placeholder="GSTIN (optional)" />
            </div>
            <button className="btn w-full">Create account</button>
          </form>
        </section>
      </div>
    );
  }

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
