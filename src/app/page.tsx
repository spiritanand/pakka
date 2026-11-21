import Link from "next/link";
import { Press, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Cascade } from "./landing/cascade";
import { DealMock } from "./landing/deal-mock";
import { ApiDemo } from "./landing/api-demo";
import { MachineView } from "./landing/machine-view";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";

const STEPS = [
  {
    title: "Write down what done means",
    body: "Milestones, a price, a deadline and a short checklist.",
  },
  {
    title: "Your client pays up front",
    body: "Razorpay holds the money. Start when the deal says Held by Razorpay.",
  },
  {
    title: "Deliver and get paid",
    body: "They accept, or tick what's missing. Silent for 72 hours? You're paid.",
  },
];

const SIDES = [
  {
    who: "If you're paying",
    points: ["Razorpay holds your money until the checklist is done.", "No delivery by the deadline? Full refund."],
  },
  {
    who: "If you're doing the work",
    points: ["Money is held before you start.", "Client goes quiet? Paid after 72 hours."],
  },
];

const BANDS = [
  { name: "New", range: "0–299", span: 30, tone: "bg-zinc-300" },
  { name: "Building", range: "300–599", span: 30, tone: "bg-amber-400" },
  { name: "Reliable", range: "600–799", span: 20, tone: "bg-lime-500" },
  { name: "Trusted", range: "800+", span: 20, tone: "bg-emerald-600" },
];

function Tick() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-1 size-4 shrink-0 text-emerald-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHead({ title, lede }: { title: string; lede?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[40px] sm:leading-[1.1]">
        {title}
      </h2>
      {lede && <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">{lede}</p>}
    </Reveal>
  );
}

function Ctas() {
  return (
    <div className="flex flex-wrap gap-3">
      <Press>
        <Link href="/login?next=/new" className="btn h-11 px-5 text-[15px]">
          Create a Pakka link
        </Link>
      </Press>
      <Press>
        <Link href="/login" className="btn-ghost h-11 px-5 text-[15px]">
          Try the demo
        </Link>
      </Press>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="-mt-10 -mb-24 sm:-mt-14">
      <MachineView />
      <section className={`${bleed} grid lg:grid-cols-[1.15fr_1fr]`}>
        <div className={`${cell} flex flex-col justify-center py-16 sm:py-24 lg:py-28`}>
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <span>Money held by</span>
            <img src="/razorpay.svg" alt="Razorpay" width={104} height={22} className="h-[22px] w-auto" />
          </div>
          <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-display">
            The money waits until the work is done.
          </h1>
          <Stagger gap={0.07} delay={0.05}>
            <StaggerItem as="p" className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
              Send your client a Pakka link. They pay up front, Razorpay holds the money, and you get it when you
              deliver. Miss the deadline and they get it back.
            </StaggerItem>
            <StaggerItem className="mt-10">
              <Ctas />
            </StaggerItem>
            <StaggerItem as="p" className="mt-6 text-[13px] text-faint">
              For deals made on WhatsApp and Instagram DMs.
            </StaggerItem>
          </Stagger>
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
        <SectionHead title="How it works" />
        <Stagger
          as="ol"
          inView
          gap={0.08}
          className="hairline mt-12 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {STEPS.map((s, i) => (
            <StaggerItem as="li" key={s.title} className={`${cell} py-8 sm:py-10`}>
              <span className="grid size-7 place-items-center rounded-full border border-line-strong text-[13px] font-medium tabular-nums text-ink-2">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <SectionHead title="Fair to both sides" lede="Someone always has to go first. Now it's Razorpay." />
        <Stagger
          inView
          gap={0.08}
          className="hairline mt-12 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
        >
          {SIDES.map((s) => (
            <StaggerItem key={s.who} className={`${cell} py-8 sm:py-10`}>
              <h3 className="text-lg font-semibold tracking-tight text-ink">{s.who}</h3>
              <ul className="mt-5 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                    <Tick />
                    {p}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <SectionHead
          title="A score built from real payments"
          lede="Finish deals and it goes up. Miss a funded deadline and it drops 300."
        />

        <Reveal className="mt-12">
          <div className="flex h-2 overflow-hidden rounded-full">
            {BANDS.map((b) => (
              <div
                key={b.name}
                className={`${b.tone} border-r-2 border-paper last:border-r-0`}
                style={{ width: `${b.span}%` }}
              />
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
        </Reveal>

        <Reveal className="mt-14 max-w-2xl">
          <h3 className="text-lg font-semibold tracking-tight text-ink">One missed deadline, three scores</h3>
          <p className="mt-1 text-sm text-pretty text-muted">
            Rohan misses a deadline. Priya vouched for him, so she loses 150.
          </p>
          <Cascade />
        </Reveal>

        <Reveal className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">

          <div className="max-w-sm">

            <h3 className="text-lg font-semibold tracking-tight text-ink">Check anyone before you pay</h3>

            <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted">

              One request, no login. You get the score, how it was built, and who vouched.

            </p>

          </div>

          <ApiDemo />

        </Reveal>
      </section>

      <section className="hairline bg-brand-soft/60 py-20 sm:py-28">
        <Reveal className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl">
              Send a Pakka link before you start.
            </h2>
            <p className="mt-4 text-lg text-muted">Pakka doesn't find you work. It makes sure you get paid for it.</p>
          </div>
          <div className="shrink-0 space-y-4">
            <Ctas />
            <p className="text-[13px] text-faint">This demo runs on Razorpay test mode. No real money moves.</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
