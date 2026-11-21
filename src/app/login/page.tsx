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

export default async function Login({ searchParams }: PageProps<"/login">) {
  const next = String((await searchParams).next ?? "/dashboard");
  if (await currentUser()) redirect(next);
  {
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
                  <input type="hidden" name="next" value={next} />
                  <button className="btn-ghost">{label}</button>
                </form>
              ))}
            </div>
            <div className="mt-3"><SeedButton /></div>
          </div>
        </section>
        <section className="space-y-4">
          <form action={signIn} className="card space-y-3">
            <input type="hidden" name="next" value={next} />
            <div className="font-semibold">Sign in</div>
            <input className="input" name="email" type="email" placeholder="Email" required />
            <input className="input" name="password" type="password" placeholder="Password" required />
            <button className="btn w-full">Sign in</button>
          </form>
          <form action={signUp} className="card space-y-3">
            <input type="hidden" name="next" value={next} />
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

}
