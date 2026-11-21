import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Press, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ApiDemo } from "./api-demo";
import { AskAi } from "./ask-ai";
import { Cascade } from "./cascade";
import { DealMock } from "./deal-mock";
import { Switcher } from "./switcher";

export type Audience = "freelancing" | "paying";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";

const HERO: Record<Audience, { h1: string; sub: string; points: string[] }> = {
  freelancing: {
    h1: "Full payment up front. Safe for both of you.",
    sub: "Send a Pakka link on WhatsApp. Your client pays, Razorpay holds it. You're paid when they accept, or after 72 hours of silence. Nothing delivered by the deadline, full refund.",
    points: [
      "Get the full amount locked in before you start.",
      "Client goes quiet? You're paid after 72 hours.",
      "Every finished deal raises your trust score.",
    ],
  },
  paying: {
    h1: "Pay up front. Get it all back if nothing is delivered.",
    sub: "Your money waits with Razorpay until you accept the work. Nothing delivered by the deadline? You get all of it back.",
    points: [
      "Your money waits with Razorpay until you accept.",
      "You both agree on a checklist before you pay, so 'done' is clear.",
      "You get 72 hours to check the work. Say nothing and it counts as accepted.",
    ],
  },
};

const STEPS: Record<Audience, { title: string; body: string }[]> = {
  freelancing: [
    { title: "Agree what done means", body: "A price, a deadline, a short checklist." },
    { title: "Your client pays up front", body: "Razorpay holds the money while you work." },
    { title: "Deliver and get paid", body: "No reply in 72 hours? You're paid anyway." },
  ],
  paying: [
    { title: "Agree what done means", body: "A price, a deadline, a short checklist." },
    { title: "You pay up front", body: "Razorpay holds the money while they work." },
    { title: "Check the work", body: "Accept it and they're paid. Nothing delivered by the deadline? You get it all back." },
  ],
};

const SIDES: Record<Audience, { title: string; points: string[] }> = {
  freelancing: {
    title: "If you're freelancing",
    points: [
      "The full amount is held before you start.",
      "Paid when they accept, or after 72 hours of silence.",
      "The checklist is agreed up front, so 'done' can't keep moving.",
    ],
  },
  paying: {
    title: "If you're paying",
    points: [
      "Your money waits with Razorpay until you accept.",
      "Nothing delivered by the deadline, you get all of it back.",
      "72 hours to check the work against the checklist.",
    ],
  },
};

const TRUST_LEDE: Record<Audience, string> = {
  freelancing: "Finish deals and it goes up. Miss a deadline and it drops 300. So does anyone who vouched for you, by 150.",
  paying: "Every freelancer has one, built from real payments. Miss a deadline and it drops 300. So does anyone who vouched for them, by 150.",
};

const CLOSE: Record<Audience, { title: string; sub: string }> = {
  freelancing: {
    title: "Send a Pakka link before you start.",
    sub: "Pakka doesn't find you work. It makes sure you get paid for it.",
  },
  paying: {
    title: "Ask for a Pakka link before you pay.",
    sub: "Your freelancer makes one in a minute. You pay Razorpay, not them.",
  },
};

const other = (a: Audience): Audience => (a === "freelancing" ? "paying" : "freelancing");

// Both audiences' text share one grid cell so switching pages never changes the block's height.
function Same({ shown, ghost }: { shown: ReactNode; ghost: ReactNode }) {
  return (
    <span className="grid">
      <span className="col-start-1 row-start-1">{shown}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {ghost}
      </span>
    </span>
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

function Ctas({ audience, demoHref = "#how" }: { audience: Audience; demoHref?: string }) {
  if (audience === "paying") {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Press>
          <Link href={demoHref} className="btn h-11 px-5 text-[15px]">
            See how a deal works
          </Link>
        </Press>
        <p className="max-w-[17rem] text-[13px] leading-snug text-muted">Opens a sample deal. Got your own Pakka link? Open it to review and pay.</p>
      </div>
    );
  }
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

export function Landing({ audience, demoHref }: { audience: Audience; demoHref?: string }) {
  const hero = HERO[audience];
  const ghost = HERO[other(audience)];
  const sides = [SIDES[audience], SIDES[other(audience)]];
  const close = CLOSE[audience];

  return (
    <div className="-mt-10 -mb-24 sm:-mt-14">
      <div className={`${bleed} ${cell} flex justify-center border-b border-line py-4 sm:py-5`}>
        <Switcher audience={audience} />
      </div>

      <section className={`${bleed} grid lg:grid-cols-[1.15fr_1fr]`}>
        <div className={`${cell} flex flex-col justify-center py-14 sm:py-20 lg:py-24`}>
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <span>Money held by</span>
            <img src="/razorpay.svg" alt="Razorpay" width={104} height={22} className="h-[22px] w-auto" />
          </div>
          <h1 className="mt-6 text-[42px] leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-display">
            <Same shown={hero.h1} ghost={ghost.h1} />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            <Same shown={hero.sub} ghost={ghost.sub} />
          </p>
          <ul className="mt-7 space-y-2.5">
            {hero.points.map((p, i) => (
              <li key={p} className="flex gap-2.5 text-[15px] leading-snug text-ink-2">
                <Check size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-emerald-600" />
                <Same shown={p} ghost={ghost.points[i]} />
              </li>
            ))}
          </ul>
          <div className="mt-9">
            <Ctas audience={audience} demoHref={demoHref} />
          </div>
          {audience === "freelancing" && (
            <p className="mt-5 text-[13px] text-muted">Free to try. Your client doesn&apos;t need an account to look.</p>
          )}
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

      <section id="how" className="section scroll-mt-16">
        <SectionHead title="A deal neither side can ghost." />
        <Stagger
          as="ol"
          inView
          gap={0.08}
          className="hairline mt-10 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {STEPS[audience].map((s, i) => (
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
        <SectionHead title="Fair to both sides" lede="Neither of you has to go first on trust." />
        <Stagger
          inView
          gap={0.08}
          className="hairline mt-10 -mb-10 grid divide-y divide-line px-0 sm:-mb-14 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
        >
          {sides.map((s, i) => (
            <StaggerItem key={s.title} className={`${cell} py-8 sm:py-10`}>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                {i === 0 && <span className="chip-emerald">You</span>}
              </div>
              <ul className="mt-4 space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
                    <Check size={16} strokeWidth={1.75} aria-hidden className="mt-1 shrink-0 text-emerald-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <SectionHead title="A score built from real payments" lede={TRUST_LEDE[audience]} />
          <Reveal>
            <Cascade />
          </Reveal>
        </div>
        <div className="hairline mt-10 grid gap-8 pt-10 sm:mt-14 sm:pt-14 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal className="max-w-md">
            <h3 className="text-xl font-semibold tracking-tight text-ink">Check anyone before you pay</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              One request, no login. You get the score, how it was built, and who vouched.
            </p>
          </Reveal>
          <Reveal className="min-w-0">
            <ApiDemo />
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-muted">
              <Link href="/machine" className="link text-muted">
                For AI agents
              </Link>
              <code className="font-mono text-[12px] break-all">curl -H &quot;Accept: text/markdown&quot; pakka.zwala.dev</code>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="hairline bg-brand-soft/60 py-20 sm:py-28">
        <Reveal className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl">
              {close.title}
            </h2>
            <p className="mt-4 text-lg text-muted">{close.sub}</p>
          </div>
          <div className="shrink-0">
            <Ctas audience={audience} demoHref={demoHref} />
          </div>
        </Reveal>
        <div className="mt-12">
          <AskAi />
        </div>
      </section>
    </div>
  );
}
