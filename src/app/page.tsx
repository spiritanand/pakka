import Link from "next/link";
import { Press, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Cascade } from "./landing/cascade";
import { DealMock } from "./landing/deal-mock";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";

const STEPS = [
  { title: "Agree what done means", body: "A price, a deadline and a short checklist." },
  { title: "Your client pays up front", body: "Razorpay holds the money. Then you start." },
  { title: "Deliver and get paid", body: "They accept, or tick what's missing. No reply in 72 hours? You're paid." },
];

const BANDS = [
  { name: "New", range: "0–299", span: 30, tone: "bg-zinc-300" },
  { name: "Building", range: "300–599", span: 30, tone: "bg-amber-400" },
  { name: "Reliable", range: "600–799", span: 20, tone: "bg-lime-500" },
  { name: "Trusted", range: "800+", span: 20, tone: "bg-emerald-600" },
];

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
      <section className={`${bleed} grid lg:grid-cols-[1.15fr_1fr]`}>
        <div className={`${cell} flex flex-col justify-center py-16 sm:py-24 lg:py-28`}>
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <span>Money held by</span>
            <img src="/razorpay.svg" alt="Razorpay" width={104} height={22} className="h-[22px] w-auto" />
          </div>
          <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-display">
            The money waits until the work is done.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            Send your client a Pakka link. They pay up front, Razorpay holds the money, and you get it when you deliver.
          </p>
          <div className="mt-10">
            <Ctas />
          </div>
          <p className="mt-6 text-[13px] text-faint">Miss the deadline and they get a full refund.</p>
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
        <SectionHead title="How it works" lede="Someone always has to go first. Now it's Razorpay." />
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
        <SectionHead
          title="A score built from real payments"
          lede="Finish deals and it goes up. Miss a funded deadline and it drops 300."
        />

        <Reveal className="mt-12 max-w-2xl">
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
            Rohan misses a deadline. Priya vouched for him, so she drops too.
          </p>
          <Cascade />
        </Reveal>

        <Reveal className="mt-8 flex max-w-2xl flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted">
          Anyone can check a score:
          <a href="/api/trust/CHVPP4321L" className="link font-mono text-[13px] break-all">
            pakka.zwala.dev/api/trust/CHVPP4321L
          </a>
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
          <div className="shrink-0">
            <Ctas />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
