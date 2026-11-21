import Link from "next/link";
import { DealMock } from "./landing/deal-mock";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";

const STEPS = [
  {
    title: "Agree what “delivered” means",
    body: "You create the deal, split it into milestones and write the checklist the work will be judged against. Send the link on WhatsApp.",
  },
  {
    title: "Client funds, Razorpay holds",
    body: "Each milestone is paid into a Razorpay Route transfer on hold. You can see the money exists before you start. Nobody can touch it.",
  },
  {
    title: "Silence always resolves",
    body: "Client says nothing for 72h after delivery: the freelancer is paid. Freelancer misses the deadline: the client is refunded.",
  },
];

const SIDES = [
  {
    who: "If you’re paying",
    points: [
      "Money leaves your account but not your control until the checklist is met.",
      "Reject with the exact items that are missing, so the fix is specific.",
      "Deadline missed, the transfer reverses and you are refunded. No chasing.",
    ],
  },
  {
    who: "If you’re doing the work",
    points: [
      "Start only after the money is visibly held. No more “I’ll pay after”.",
      "A client who goes quiet can’t stall you: 72h of silence releases the payout.",
      "Every finished deal raises a score you can show the next client.",
    ],
  },
];

const BANDS = [
  { name: "New", range: "0–299", span: 30, tone: "bg-zinc-300" },
  { name: "Building", range: "300–599", span: 30, tone: "bg-amber-400" },
  { name: "Reliable", range: "600–799", span: 20, tone: "bg-lime-500" },
  { name: "Trusted", range: "800+", span: 20, tone: "bg-emerald-600" },
];

const RULES = [
  ["Only money moves it", "Points come from funded milestones that paid out, refunded or reversed. Reviews and likes count for nothing."],
  ["No farming one friend", "At most 3 deals per counterparty count, so two people can’t pump each other."],
  ["Ghosting costs 300", "Take a funded milestone and vanish past the deadline, and you lose 300 points."],
  ["Vouches carry weight", "A vouch is worth a tenth of the voucher’s own score. A vouch from a Trusted person moves you more."],
  ["Vouching has a cost", "If someone you vouched for ghosts, you lose 150. Vouch for people you’d stake your name on."],
];

const CASCADE = [
  { name: "Rohan", why: "Ghosted a funded milestone", from: 323, to: 0 },
  { name: "Priya", why: "Vouched for Rohan", from: 695, to: 545 },
  { name: "Arjun", why: "Vouched for by Priya, whose weight fell", from: 554, to: 539 },
];

const ITCHES = [
  ["Carpenters", "Stage payments for material, frame and finish. Each stage is released when it’s signed off."],
  ["Painters", "Pay room by room. The checklist is the photo of the finished wall."],
  ["Appliance repair", "Hold part of the bill for 30 days. If the fix fails, the warranty is already funded."],
  ["Deep cleaning", "One checklist per room. Paid when every box is ticked, or after 72h of silence."],
];

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHead({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[40px] sm:leading-[1.1]">{title}</h2>
      {lede && <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">{lede}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="-mt-10 -mb-24 sm:-mt-14">
      <section className={`${bleed} grid lg:grid-cols-[1.15fr_1fr]`}>
        <div className={`${cell} flex flex-col justify-center py-16 sm:py-24 lg:py-28`}>
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <span>Payments secured by</span>
            <img src="/razorpay.svg" alt="Razorpay" width={104} height={22} className="h-[22px] w-auto" />
          </div>
          <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-display">
            Whoever moves first is exposed.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            Pakka holds the money until the work lands, and turns every finished deal into a trust score both sides carry.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login" className="btn h-11 px-5 text-[15px]">Create a protected deal</Link>
            <Link href="/login" className="btn-ghost h-11 px-5 text-[15px]">See a live deal</Link>
          </div>
          <p className="mt-6 text-[13px] text-faint">For deals that start on WhatsApp and Instagram. No marketplace, no bidding.</p>
        </div>
        <div
          className={`${cell} relative flex items-center justify-center border-t border-line bg-wash py-14 sm:py-20 lg:border-t-0 lg:border-l`}
          style={{
            backgroundImage:
              "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "-1px -1px",
          }}
        >
          <DealMock />
        </div>
      </section>

      <section className="section">
        <SectionHead title="Three steps, and no step depends on trust" />
        <ol className="hairline mt-12 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`${cell} py-8 sm:py-10`}>
              <span className="grid size-7 place-items-center rounded-full border border-line-strong text-[13px] font-medium tabular-nums text-ink-2">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <SectionHead title="Both sides protected" lede="Most deals fall apart in the gap between paying and delivering. Pakka closes the gap from both ends." />
        <div className="hairline mt-12 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {SIDES.map((s) => (
            <div key={s.who} className={`${cell} py-8 sm:py-10`}>
              <h3 className="text-lg font-semibold tracking-tight text-ink">{s.who}</h3>
              <ul className="mt-5 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                    <Tick />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead
          title="A score from 0 to 1000 that only money can move"
          lede="Every outcome on Pakka is a Razorpay transfer that released, refunded or reversed. That is the only thing the score reads."
        />

        <div className="mt-12">
          <div className="flex h-2 overflow-hidden rounded-full">
            {BANDS.map((b) => (
              <div key={b.name} className={`${b.tone} border-r-2 border-paper last:border-r-0`} style={{ width: `${b.span}%` }} />
            ))}
          </div>
          <div className="mt-3 flex">
            {BANDS.map((b) => (
              <div key={b.name} style={{ width: `${b.span}%` }} className="pr-2">
                <div className="text-sm font-medium text-ink">{b.name}</div>
                <div className="text-xs tabular-nums text-muted">{b.range}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">What moves it</h3>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {RULES.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-sm font-medium text-ink">{k}</dt>
                  <dd className="text-sm leading-relaxed text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">One ghost, three scores</h3>
            <p className="mt-1 text-sm text-muted">Rohan takes a funded milestone and disappears. The cost travels up the people who backed him.</p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {CASCADE.map((c) => (
                <li key={c.name} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-ink">{c.name}</span>
                      <span className="ml-2 text-sm text-muted">{c.why}</span>
                    </div>
                    <div className="shrink-0 text-sm tabular-nums">
                      <span className="text-faint line-through decoration-faint/60">{c.from}</span>
                      <span className="mx-1.5 text-faint">to</span>
                      <span className="font-semibold text-ink">{c.to}</span>
                      <span className="ml-2 text-rose-700">−{c.from - c.to}</span>
                    </div>
                  </div>
                  <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="absolute inset-y-0 left-0 bg-rose-200" style={{ width: `${c.from / 10}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${c.to / 10}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <p className="text-sm text-muted">Not a marketplace</p>
            <p className="mt-4 text-3xl leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[40px]">
              Upwork owns the client and your reputation. Pakka owns neither: you bring the deal from WhatsApp, your score leaves with your PAN.
            </p>
          </div>
          <ul className="space-y-4 self-end text-[15px] leading-relaxed text-ink-2">
            <li className="flex gap-3"><Tick />You find the client. A referral, a DM, a cousin’s friend.</li>
            <li className="flex gap-3"><Tick />No bidding, no profile ranking, no platform between you.</li>
            <li className="flex gap-3"><Tick />Your score is tied to your PAN, not to an account someone can close.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <SectionHead title="Same link, other itches" lede="Anywhere one side pays before the other delivers, the same held-money link works." />
        <div className="hairline mt-12 -mb-10 grid px-0 sm:-mb-14 sm:grid-cols-2 lg:grid-cols-4">
          {ITCHES.map(([k, v]) => (
            <div key={k} className={`${cell} border-t border-line py-8 first:border-t-0 sm:py-10 sm:odd:border-r sm:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:border-r lg:last:border-r-0`}>
              <h3 className="font-semibold tracking-tight text-ink">{k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionHead
              title="Your score is one request away"
              lede="Lenders, landlords and other platforms can check a PAN before they extend trust. The answer shows outcomes, not opinions."
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink text-[13px] leading-relaxed">
            <div className="border-b border-white/10 px-5 py-3 font-mono text-white/90">
              <span className="text-emerald-400">$</span> curl pakka.app/api/trust/<span className="text-emerald-300">ABCPR1234K</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-white/70">{`{
  "subject": { "name": "Priya", "pan": "ABCXXXX34K" },
  "score": 695,
  "band": "Reliable",
  "stats": { "delivered": 9, "ghosted": 0 },
  "vouched_by": [{ "name": "Arjun", "score": 554, "weight": 55 }]
}`}</pre>
          </div>
        </div>
      </section>

      <section className="hairline bg-brand-soft/60 py-20 sm:py-28">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl">
              Nobody has to move first anymore.
            </h2>
            <p className="mt-4 text-lg text-muted">Make the link, send it where the deal already lives.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/login" className="btn h-11 px-5 text-[15px]">Create a protected deal</Link>
            <Link href="/login" className="btn-ghost h-11 px-5 text-[15px]">See a live deal</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
