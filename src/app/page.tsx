import Link from "next/link";
import { Press, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Cascade } from "./landing/cascade";
import { DealMock } from "./landing/deal-mock";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";

const STEPS = [
  { title: "Agree what done means", body: "A price, a deadline, a short checklist." },
  { title: "Your client pays up front", body: "Razorpay holds the money while you work." },
  { title: "Deliver and get paid", body: "No reply in 72 hours? You're paid anyway." },
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
          <p className="mt-6 text-[13px] text-muted">Free to try. Your client doesn&apos;t need an account to look.</p>
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
          className="hairline mt-10 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
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
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <SectionHead
            title="A score built from real payments"
            lede="Finish deals and it goes up. Miss a deadline and it drops 300. So does anyone who vouched for you, by 150."
          />
          <Reveal className="lg:row-span-2">
            <Cascade />
          </Reveal>
          <Reveal className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted lg:-mt-2">
            Anyone can check a score:
            <a href="/api/trust/CHVPP4321L" target="_blank" rel="noopener noreferrer" className="link font-mono text-[13px] break-all">
              pakka.zwala.dev/api/trust/CHVPP4321L
            </a>
          </Reveal>
        </div>
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
