import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Press } from "@/components/motion";
import { ApiDemo } from "./api-demo";
import { AskAi } from "./ask-ai";
import { Cascade } from "./cascade";
import { DealMock } from "./deal-mock";
import { Switcher } from "./switcher";

export type Audience = "freelancing" | "paying";

const bleed = "-mx-(--rail-pad)";
const cell = "px-(--rail-pad)";
const band = "section sm:py-24";

const HERO: Record<Audience, { lead: string; rest: string; sub: string }> = {
  freelancing: {
    lead: "Full payment up front.",
    rest: "Safe for both of you.",
    sub: "Razorpay holds the money. You're paid when your client accepts, or after 72 hours of silence.",
  },
  paying: {
    lead: "Pay up front.",
    rest: "Get it all back if nothing is delivered.",
    sub: "Razorpay holds your money until you accept the work.",
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

const MOMENTS = ["Before work starts", "After delivery", "If it goes wrong"];

const SIDES: Record<Audience, { title: string; cells: string[] }> = {
  freelancing: {
    title: "If you're freelancing",
    cells: [
      "The full amount is held by Razorpay before you start.",
      "You're paid when they accept, or after 72 hours of silence.",
      "The checklist was agreed up front, so 'done' can't keep moving.",
    ],
  },
  paying: {
    title: "If you're paying",
    cells: [
      "Your money waits with Razorpay, not with the freelancer.",
      "You get 72 hours to check the work against the checklist.",
      "Nothing delivered by the deadline? You get all of it back.",
    ],
  },
};

const TRUST_LEDE: Record<Audience, string> = {
  freelancing: "Finish deals and it goes up. Miss a deadline and it drops 300. So does anyone who vouched for you, by 150.",
  paying: "Every freelancer has one, built from real payments. Miss a deadline and it drops 300. So does anyone who vouched for them, by 150.",
};

const CLOSE: Record<Audience, { lead: string; rest: string }> = {
  freelancing: {
    lead: "Send a Pakka link before you start.",
    rest: "Pakka doesn't find you work. It makes sure you get paid for it.",
  },
  paying: {
    lead: "Ask for a Pakka link before you pay.",
    rest: "Your freelancer makes one in a minute. You pay Razorpay, not them.",
  },
};

const other = (a: Audience): Audience => (a === "freelancing" ? "paying" : "freelancing");

// Both audiences' text share one grid cell so switching pages never changes the block's height.
function TwoTone({ lead, rest }: { lead: string; rest: string }) {
  return (
    <>
      {lead} <span className="text-muted">{rest}</span>
    </>
  );
}

function Ctas({ audience, demoHref = "#how" }: { audience: Audience; demoHref?: string }) {
  const primary =
    audience === "paying"
      ? { href: demoHref, label: "See how a deal works" }
      : { href: "/login?next=/new", label: "Create a Pakka link" };
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Press>
        <Link href={primary.href} className="group btn h-11 px-5">
          {primary.label}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Press>
      <Link href="/login" className="inline-flex h-11 items-center text-sm font-medium text-ink-2 transition-colors hover:text-ink">
        Try the demo
      </Link>
    </div>
  );
}

export function Landing({ audience, demoHref }: { audience: Audience; demoHref?: string }) {
  const hero = HERO[audience];
  const sides = [SIDES[audience], SIDES[other(audience)]];
  const close = CLOSE[audience];

  return (
    <div className="-mt-12 -mb-24 sm:-mt-16">
      <div className={`${bleed} ${cell} flex justify-center border-b border-line py-3`}>
        <Switcher audience={audience} />
      </div>

      <section className={`${bleed} grid lg:grid-cols-[1.1fr_1fr]`}>
        <div className={`${cell} flex flex-col justify-center py-14 sm:py-20 lg:py-24`}>
          <p className="flex items-center gap-2 text-meta text-muted">
            Money held by
            <img src="/razorpay.svg" alt="Razorpay" width={95} height={20} className="h-5 w-auto" />
          </p>
          <h1 className="mt-6 max-w-xl text-display text-ink">
            <TwoTone lead={hero.lead} rest={hero.rest} />
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
            {hero.sub}
          </p>
          <div className="mt-8">
            <Ctas audience={audience} demoHref={demoHref} />
          </div>
        </div>
        <div
          className={`${cell} flex items-center justify-center border-t border-line bg-wash py-14 sm:py-20 lg:border-t-0 lg:border-l`}
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "-1px -1px",
          }}
        >
          <DealMock />
        </div>
      </section>

      <section id="how" className={`${band} scroll-mt-16`}>
        <h2 className="max-w-2xl text-display text-ink">A deal neither side can ghost.</h2>
        <ol className="hairline mt-12 -mb-12 grid divide-y divide-line sm:-mb-24 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS[audience].map((s, i) => (
            <li key={s.title} className={`${cell} py-8 sm:py-10`}>
              <span className="text-meta text-muted tabular-nums">{i + 1}</span>
              <h3 className="mt-4 text-heading text-ink">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={band}>
        <h2 className="max-w-3xl text-display text-ink">
          <TwoTone lead="Fair to both sides." rest="Neither of you has to go first on trust." />
        </h2>
        <div className="hairline mt-12 -mb-12 sm:-mb-24">
          <div className="hidden border-b border-line sm:grid sm:grid-cols-[11rem_1fr_1fr]">
            <span />
            {sides.map((s, i) => (
              <span key={s.title} className={`${cell} flex items-center gap-2 border-l border-line py-4 text-sm font-medium text-ink`}>
                {s.title}
                {i === 0 && <span className="chip-zinc">You</span>}
              </span>
            ))}
          </div>
          <dl className="divide-y divide-line">
            {MOMENTS.map((m, r) => (
              <div key={m} className="grid sm:grid-cols-[11rem_1fr_1fr]">
                <dt className={`${cell} pt-6 text-meta text-muted sm:py-6`}>{m}</dt>
                {sides.map((s) => (
                  <dd key={s.title} className={`${cell} pt-3 last:pb-6 sm:border-l sm:border-line sm:py-6`}>
                    <span className="block text-meta text-muted sm:hidden">{s.title}</span>
                    <span className="text-base leading-relaxed text-ink-2">{s.cells[r]}</span>
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={band}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <h2 className="text-display text-ink">A score built from real payments.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">{TRUST_LEDE[audience]}</p>
          </div>
          <Cascade />
        </div>
        <div className="hairline mt-12 grid gap-8 pt-12 sm:mt-16 sm:pt-16 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <div className="max-w-md">
            <h3 className="text-heading text-ink">Check anyone before you pay</h3>
            <p className="mt-2 text-base leading-relaxed text-ink-2">
              One request, no login. You get the score, how it was built, and who vouched.
            </p>
          </div>
          <div className="min-w-0">
            <ApiDemo />
          </div>
        </div>
      </section>

      <section className={`${band} bg-wash`}>
        <h2 className="max-w-4xl text-display text-ink">
          <TwoTone lead={close.lead} rest={close.rest} />
        </h2>
        <div className="mt-10">
          <Ctas audience={audience} demoHref={demoHref} />
        </div>
        <div className="hairline mt-16 -mb-12 py-5 sm:-mb-24">
          <AskAi />
        </div>
      </section>
    </div>
  );
}
