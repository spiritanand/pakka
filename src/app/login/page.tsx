import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signIn, signUp } from "../actions";
import { SeedButton } from "../seed-button";
import { SubmitButton } from "@/components/submit-button";
import { firstName, safeNext } from "../format";
import { getUser } from "@/lib/db";
import { createdByClient, getDealBySlug } from "@/lib/deals";
import { BackLink } from "@/components/back-link";

const PERSONAS = [
  ["meera", "Meera · client"],
  ["rohan", "Rohan · freelancer"],
  ["priya", "Priya · voucher"],
  ["arjun", "Arjun · freelancer"],
];

const ERRORS: Record<string, string> = {
  signin: "That email and password don't match. Try again.",
  email: "There's already an account with that email. Sign in instead.",
  pan: "That PAN is already on another account.",
  phone: "That phone number is already on another account.",
  signup: "We couldn't create your account. Check the details and try again.",
};

export async function generateMetadata({ searchParams }: PageProps<"/login">): Promise<Metadata> {
  return { title: (await searchParams).mode === "signin" ? "Sign in" : "Create an account" };
}

function dealFor(next: string) {
  if (!next.startsWith("/d/")) return null;
  const deal = getDealBySlug(next.slice(3).split(/[/?#]/)[0]);
  if (!deal) return null;
  const nameOf = (id: string | null, fallback: string) => firstName((id && getUser(id)?.name) || fallback);
  return {
    title: deal.title,
    joining: createdByClient(deal) && !deal.freelancer_id,
    freelancer: nameOf(deal.freelancer_id, "the freelancer"),
    client: nameOf(deal.client_id, "The client"),
  };
}

export default async function Login({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  const mode = sp.mode === "signin" ? "signin" : "signup";
  const href = (m: string) => `/login?mode=${m}${sp.next ? `&next=${encodeURIComponent(next)}` : ""}`;
  if (await currentUser()) redirect(next);
  const target = dealFor(next);
  const payer = target && !target.joining ? target : null;
  const joiner = target?.joining ? target : null;
  return (
    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-0">
      <section className="lg:pt-2 lg:pr-14">
        {target ? <div className="pb-6"><BackLink href={next} label="Back to the deal" /></div> : null}
        <h1 className="text-title">
          {payer ? `Fund ${payer.title}` : joiner ? `Accept ${joiner.title}` : "The money waits until the work is done."}
        </h1>
        <p className="mt-3 max-w-lg text-ink-2">
          {payer
            ? `Your money goes to Razorpay, not to ${payer.freelancer}. Create an account so the refund knows where to go.`
            : joiner
              ? `${joiner.client} pays up front once you accept. Razorpay holds the money until you deliver.`
              : "Your client pays up front. Razorpay holds it until you deliver."}
        </p>
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink">Or try the demo</h2>
          <div className="mt-3 grid max-w-sm grid-cols-2 gap-2">
            {PERSONAS.map(([k, label]) => (
              <form key={k} action={signIn}>
                <input type="hidden" name="email" value={`${k}@pakka.demo`} />
                <input type="hidden" name="password" value="pakka1234" />
                <input type="hidden" name="next" value={next} />
                <SubmitButton className="btn-ghost w-full">{label}</SubmitButton>
              </form>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <SeedButton />
        </div>
      </section>

      <section className="border-t border-line pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
        <div className="max-w-md">
          <nav aria-label="Account" className="inline-flex rounded-md bg-wash p-1 text-sm">
            {[["signup", "Create account"], ["signin", "Sign in"]].map(([m, label]) => (
              <Link
                key={m}
                href={href(m)}
                aria-current={mode === m ? "page" : undefined}
                className={`rounded-sm px-4 py-1.5 font-medium transition-colors ${
                  mode === m ? "bg-paper text-ink ring-1 ring-line" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {mode === "signup" ? (
            <form action={signUp} className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <h2 className="text-heading">Create your account</h2>
                <p className="mt-1 text-sm text-muted">
                  {payer ? "Takes a minute. Just your name, email and a password." : "Takes a minute. PAN and GSTIN are optional and raise your starting score."}
                </p>
              </div>
              <Field label="Name"><input className="input" name="name" placeholder="Your name" autoComplete="name" required autoFocus /></Field>
              {payer ? (
                <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></Field>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></Field>
                  <Field label="Phone"><input className="input" name="phone" placeholder="98xxxxxxxx" autoComplete="tel" inputMode="tel" /></Field>
                </div>
              )}
              <Field label="Password"><input className="input" name="password" type="password" placeholder="6 characters or more" autoComplete="new-password" minLength={6} required /></Field>
              {payer ? null : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="PAN (optional)"><input className="input uppercase" name="pan" placeholder="ABCDE1234F" maxLength={10} /></Field>
                  <Field label="GSTIN (optional)"><input className="input uppercase" name="gstin" placeholder="29ABCDE1234F1Z5" maxLength={15} /></Field>
                </div>
              )}
              {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
              <SubmitButton className="btn w-full" busy="Creating account…">Create account</SubmitButton>
            </form>
          ) : (
            <form action={signIn} className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <h2 className="text-heading">Welcome back</h2>
                <p className="mt-1 text-sm text-muted">Your deals are where you left them.</p>
              </div>
              <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required autoFocus /></Field>
              <Field label="Password"><input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required /></Field>
              {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
              <SubmitButton className="btn w-full" busy="Signing in…">Sign in</SubmitButton>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label block">{label}</span>
      {children}
    </label>
  );
}
