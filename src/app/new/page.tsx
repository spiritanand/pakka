import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createDeal } from "../actions";
import { MilestoneFields } from "./milestones";
import { NOT_BLANK } from "../format";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = { title: "New deal" };

const ERRORS: Record<string, (m: string) => string> = {
  title: () => "Give the project a title.",
  partial: (m) => `Milestone ${m} is only half filled. Add a title, an amount and a checklist, or leave it empty.`,
  empty: () => "Add at least one milestone with a title, an amount and a checklist.",
};

export default async function NewDeal({ searchParams }: PageProps<"/new">) {
  if (!(await currentUser())) redirect("/login?next=/new");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error]?.(typeof sp.m === "string" ? sp.m.replace(/\D/g, "") : "") : undefined;
  return (
    <form action={createDeal}>
      <header className="max-w-2xl pb-12">
        <BackLink href="/dashboard" label="Dashboard" className="mb-6" />
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">New deal</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Say what done means. Get a link to send your client.
        </p>
        {error ? <p role="alert" className="mt-6 border-l-2 border-rose-600 pl-3 text-sm text-rose-700">{error}</p> : null}
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-semibold">Project</h2>
          <p className="mt-1 text-[13px] text-muted">Your client sees this at the top of the link.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input h-12 text-base" name="title" placeholder="Shopify store for Meera's brand" pattern={NOT_BLANK} title="Add a project title" required />
        </label>
      </section>

      <MilestoneFields />
    </form>
  );
}
