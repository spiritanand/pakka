import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createDeal } from "../actions";

export default async function NewDeal() {
  if (!(await currentUser())) redirect("/");
  return (
    <form action={createDeal}>
      <header className="max-w-2xl pb-12">
        <div className="eyebrow">You're the freelancer</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">New deal</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Split the job into milestones and write what “delivered” means for each. Then send the link to your client.
        </p>
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-semibold">Project</h2>
          <p className="mt-1 text-[13px] text-muted">Your client sees this at the top of the link.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input h-12 text-base" name="title" placeholder="Project, e.g. Shopify store for Meera's brand" required />
        </label>
      </section>

      {[0, 1].map((i) => (
        <section key={i} className={`section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12 ${i ? "bg-wash" : ""}`}>
          <div>
            <div className="font-mono text-sm text-faint tabular-nums">0{i + 1}</div>
            <h2 className={`mt-1 font-semibold ${i ? "text-ink-2" : ""}`}>
              Milestone {i + 1}
              {i ? <span className="font-normal text-muted"> (optional)</span> : null}
            </h2>
            <p className="mt-1 text-[13px] text-muted">Paid and delivered on its own.</p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem_8rem]">
              <label className="block space-y-1.5">
                <span className="label block">Title</span>
                <input className="input" name="m_title" placeholder="Title" required={!i} />
              </label>
              <label className="block space-y-1.5">
                <span className="label block">Amount (₹)</span>
                <input className="input tabular-nums" name="m_amount" type="number" min="1" placeholder="₹ amount" required={!i} />
              </label>
              <label className="block space-y-1.5">
                <span className="label block">Due in days</span>
                <input className="input tabular-nums" name="m_due" type="number" min="1" placeholder="Due in days" defaultValue={7} />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="label block">Delivered means (one item per line)</span>
              <textarea
                className="input min-h-28 leading-relaxed"
                name="m_checklist"
                placeholder={"Homepage live on staging URL\n3 product pages"}
                required={!i}
              />
              <span className="block text-xs text-muted">
                Keep each item checkable. Your client can only send work back by ticking one.
              </span>
            </label>
          </div>
        </section>
      ))}

      <section className="section flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-muted">Your client pays nothing until they fund a milestone.</p>
        <button className="btn h-11 px-5">Create Pakka link</button>
      </section>
    </form>
  );
}
