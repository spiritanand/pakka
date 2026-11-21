import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signIn, signUp } from "../actions";
import { SeedButton } from "../seed-button";

const PERSONAS = [
  ["meera", "Meera · client"],
  ["rohan", "Rohan · freelancer"],
  ["priya", "Priya · voucher"],
  ["arjun", "Arjun"],
];

const RULES = [
  ["Freelancer misses the deadline", "Client is refunded in full."],
  ["Client goes silent after delivery", "Freelancer is paid in 72h."],
  ["Every outcome", "Moves both scores, and the scores of whoever vouched."],
];

export default async function Login({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = String(sp.next ?? "/dashboard");
  const mode = sp.mode === "signin" ? "signin" : "signup";
  const href = (m: string) => `/login?mode=${m}${sp.next ? `&next=${encodeURIComponent(next)}` : ""}`;
  if (await currentUser()) redirect(next);
  return (
    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-0">
      <section className="lg:pr-14">
        <div className="eyebrow">Pay links for WhatsApp deals</div>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-balance text-ink sm:text-6xl">
          Whoever moves first is exposed.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
          A pay link that <span className="font-medium text-ink">holds the money on Razorpay</span> until the work lands, and
          turns every finished deal into a <span className="font-medium text-ink">0–1000 trust score</span> both sides carry anywhere.
        </p>
        <dl className="mt-10 max-w-lg border-t border-line">
          {RULES.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-line py-3 text-sm sm:grid-cols-[14rem_1fr] sm:gap-4">
              <dt className="font-medium text-ink">{k}</dt>
              <dd className="text-ink-2">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold text-ink">Try the demo as</h2>
            <SeedButton />
          </div>
          <p className="mt-1 text-[13px] text-muted">One click signs you in. Open a second browser to play the other side.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PERSONAS.map(([k, label]) => (
              <form key={k} action={signIn}>
                <input type="hidden" name="email" value={`${k}@pakka.demo`} />
                <input type="hidden" name="password" value="pakka1234" />
                <input type="hidden" name="next" value={next} />
                <button className="btn-ghost">{label}</button>
              </form>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
        <div className="max-w-md">
          <div role="tablist" className="inline-flex rounded-lg border border-line bg-wash p-1 text-sm">
            {[["signup", "Create account"], ["signin", "Sign in"]].map(([m, label]) => (
              <Link
                key={m}
                href={href(m)}
                role="tab"
                aria-selected={mode === m}
                className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                  mode === m ? "bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {mode === "signup" ? (
            <form action={signUp} className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Start your first protected deal</h2>
                <p className="mt-1.5 text-sm text-muted">Free for freelancers. Your score is tied to your PAN, so it follows you off the platform.</p>
              </div>
              <Field label="Name"><input className="input" name="name" placeholder="Your name" autoComplete="name" required autoFocus /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></Field>
                <Field label="Phone"><input className="input" name="phone" placeholder="98xxxxxxxx" autoComplete="tel" inputMode="tel" /></Field>
              </div>
              <Field label="Password"><input className="input" name="password" type="password" placeholder="6 characters or more" autoComplete="new-password" minLength={6} required /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="PAN"><input className="input uppercase" name="pan" placeholder="ABCDE1234F" maxLength={10} /></Field>
                <Field label="GSTIN (optional)"><input className="input uppercase" name="gstin" placeholder="29ABCDE1234F1Z5" maxLength={15} /></Field>
              </div>
              <button className="btn h-11 w-full">Create account</button>
              <p className="text-center text-sm text-muted">
                Already have an account? <Link href={href("signin")} className="link">Sign in</Link>
              </p>
            </form>
          ) : (
            <form action={signIn} className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                <p className="mt-1.5 text-sm text-muted">Pick up your deals where you left them.</p>
              </div>
              <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required autoFocus /></Field>
              <Field label="Password"><input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required /></Field>
              <button className="btn h-11 w-full">Sign in</button>
              <p className="text-center text-sm text-muted">
                New to Pakka? <Link href={href("signup")} className="link">Create an account</Link>
              </p>
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
