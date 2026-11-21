import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { signIn, signUp } from "../actions";
import { SeedButton } from "../seed-button";
import { Enter } from "@/components/motion";

const PERSONAS = [
  ["meera", "Meera · client"],
  ["rohan", "Rohan · freelancer"],
  ["priya", "Priya · voucher"],
  ["arjun", "Arjun"],
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
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-ink sm:text-4xl">
          The money waits until the work is done.
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-2">
          Your client pays up front. Razorpay holds it until you deliver.
        </p>
        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold text-ink">Try the demo as</h2>
            <SeedButton />
          </div>
          <p className="mt-1 text-[13px] text-muted">One click signs you in.</p>
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

          <Enter key={mode} y={6}>
          {mode === "signup" ? (
            <form action={signUp} className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
                <p className="mt-1.5 text-sm text-muted">Add your PAN and your score starts 60 points higher. A GSTIN adds 40 more.</p>
              </div>
              <Field label="Name"><input className="input" name="name" placeholder="Your name" autoComplete="name" required autoFocus /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></Field>
                <Field label="Phone"><input className="input" name="phone" placeholder="98xxxxxxxx" autoComplete="tel" inputMode="tel" /></Field>
              </div>
              <Field label="Password"><input className="input" name="password" type="password" placeholder="6 characters or more" autoComplete="new-password" minLength={6} required /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="PAN (optional)"><input className="input uppercase" name="pan" placeholder="ABCDE1234F" maxLength={10} /></Field>
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
                <p className="mt-1.5 text-sm text-muted">Your deals are where you left them.</p>
              </div>
              <Field label="Email"><input className="input" name="email" type="email" placeholder="you@example.com" autoComplete="email" required autoFocus /></Field>
              <Field label="Password"><input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required /></Field>
              <button className="btn h-11 w-full">Sign in</button>
              <p className="text-center text-sm text-muted">
                New to Pakka? <Link href={href("signup")} className="link">Create an account</Link>
              </p>
            </form>
          )}
          </Enter>
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
