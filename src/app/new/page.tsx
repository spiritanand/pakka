import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createDeal } from "../actions";
import { SubmitButton } from "@/components/submit-button";

export default async function NewDeal() {
  if (!(await currentUser())) redirect("/");
  return (
    <form action={createDeal}>
      <header className="max-w-2xl pb-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">New deal</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Say what done means. Get a link to send your client.
        </p>
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-semibold">Project</h2>
          <p className="mt-1 text-[13px] text-muted">Your client sees this at the top of the link.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input h-12 text-base" name="title" placeholder="Shopify store for Meera's brand" required />
        </label>
      </section>

      {[0, 1].map((i) => (
        <section key={i} className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
          <div>
            <div className="font-mono text-sm text-muted tabular-nums">0{i + 1}</div>
            <h2 className={`mt-1 font-semibold ${i ? "text-ink-2" : ""}`}>
              Milestone {i + 1}
              {i ? <span className="font-normal text-muted"> (optional)</span> : null}
            </h2>
            {i ? null : <p className="mt-1 text-[13px] text-muted">Each milestone is funded and paid separately.</p>}
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem_8rem]">
              <label className="block space-y-1.5">
                <span className="label block">Title</span>
                <input className="input" name="m_title" placeholder={i ? "Checkout + launch" : "Homepage + product pages"} required={!i} />
              </label>
              <label className="block space-y-1.5">
                <span className="label block">Amount (₹)</span>
                <input className="input tabular-nums" name="m_amount" type="number" min="1" placeholder="15000" required={!i} />
              </label>
              <label className="block space-y-1.5">
                <span className="label block">Due in days</span>
                <input className="input tabular-nums" name="m_due" type="number" min="1" placeholder="Due in days" defaultValue={i ? 14 : 7} />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="label block">Delivered means</span>
              <textarea
                className="input min-h-28 leading-relaxed"
                name="m_checklist"
                placeholder={i ? "Razorpay checkout working\nStore live on custom domain" : "Homepage live on staging URL\n3 product pages"}
                required={!i}
              />
              {i ? null : (
                <span className="block text-xs text-muted">
                  One item per line. Your client ticks what's missing if they send it back.
                </span>
              )}
            </label>
          </div>
        </section>
      ))}

      <section className="section flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-muted">Your client pays nothing until they fund a milestone.</p>
        <SubmitButton className="btn h-11 px-5" busy="Creating…">Create Pakka link</SubmitButton>
      </section>
    </form>
  );
}
