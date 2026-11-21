import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createDeal } from "../actions";
import { MilestoneFields } from "./milestones";
import { NOT_BLANK } from "../format";
import { BackLink } from "@/components/back-link";
import { ByRole } from "./by-role";

export const metadata: Metadata = { title: "New deal" };

const ERRORS: Record<string, (m: string) => string> = {
  title: () => "Give the project a title.",
  partial: (m) => `Milestone ${m} is only half filled. Add a title, an amount and a checklist, or leave it empty.`,
  empty: () => "Add at least one milestone with a title, an amount and a checklist.",
};

const SIDES = [
  ["freelancer", "I'm doing the work"],
  ["client", "I'm paying"],
];

export default async function NewDeal({ searchParams }: PageProps<"/new">) {
  if (!(await currentUser())) redirect("/login?next=/new");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error]?.(typeof sp.m === "string" ? sp.m.replace(/\D/g, "") : "") : undefined;
  return (
    <form action={createDeal}>
      <header className="max-w-2xl pb-10">
        <BackLink href="/dashboard" label="Dashboard" className="mb-6" />
        <h1 className="text-title">New deal</h1>
        <fieldset className="mt-5">
          <legend className="sr-only">Your side of the deal</legend>
          <div className="inline-flex rounded-md bg-wash p-1 text-sm">
            {SIDES.map(([value, label]) => (
              <label
                key={value}
                className="cursor-pointer rounded-sm px-4 py-1.5 font-medium text-muted transition-colors hover:text-ink has-checked:bg-paper has-checked:text-ink has-checked:ring-1 has-checked:ring-line has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-600"
              >
                <input type="radio" name="role" value={value} defaultChecked={value === "freelancer"} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-4 text-ink-2">
          Say what done means. <ByRole work="Get a link to send your client." pay="Get a link to send the freelancer." />
        </p>
        {error ? <p role="alert" className="mt-6 border-l-2 border-rose-600 pl-3 text-sm text-rose-700">{error}</p> : null}
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-medium">Project</h2>
          <p className="mt-1 text-meta text-muted">
            <ByRole work="Your client sees this at the top of the link." pay="The freelancer sees this at the top of the link." />
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input" name="title" placeholder="Shopify store for Meera's brand" pattern={NOT_BLANK} title="Add a project title" required />
        </label>
      </section>

      <MilestoneFields />
    </form>
  );
}
