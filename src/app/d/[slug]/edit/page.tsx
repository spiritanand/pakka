import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getDealBySlug, getMilestones, isEditable } from "@/lib/deals";
import { BackLink } from "@/components/back-link";
import { updateDeal } from "../../../actions";
import { MilestoneFields } from "../../../new/milestones";
import { NOT_BLANK } from "../../../format";

export const metadata: Metadata = { title: "Edit deal" };

const DAY = 86400_000;

const ERRORS: Record<string, (m: string) => string> = {
  title: () => "Give the project a title.",
  partial: (m) => `Milestone ${m} is only half filled. Add a title, an amount and a checklist, or leave it empty.`,
  empty: () => "Add at least one milestone with a title, an amount and a checklist.",
  locked: () => "Your client has started paying, so this deal can't be changed any more.",
};

export default async function EditDeal({ params, searchParams }: PageProps<"/d/[slug]/edit">) {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) notFound();
  const u = await currentUser();
  if (!u) redirect(`/login?mode=signin&next=/d/${slug}/edit`);
  if (u.id !== deal.freelancer_id) redirect(`/d/${slug}`);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error]?.(typeof sp.m === "string" ? sp.m.replace(/\D/g, "") : "") : undefined;
  if (!isEditable(deal.id) && !error) redirect(`/d/${slug}`);
  const initial = getMilestones(deal.id).map((m) => ({
    title: m.title,
    amount: String(m.amount / 100),
    checklist: (JSON.parse(m.checklist) as string[]).join("\n"),
    due: Math.max(1, Math.round((m.due_at - deal.created_at) / DAY)),
  }));
  return (
    <form action={updateDeal}>
      <input type="hidden" name="slug" value={slug} />
      <header className="max-w-2xl pb-12">
        <BackLink href={`/d/${slug}`} label="Back to deal" className="mb-6" />
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Edit deal</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">You can change anything until your client starts paying.</p>
        {error ? <p role="alert" className="mt-6 border-l-2 border-rose-600 pl-3 text-sm text-rose-700">{error}</p> : null}
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-semibold">Project</h2>
          <p className="mt-1 text-[13px] text-muted">Your client sees this at the top of the link.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input h-12 text-base" name="title" defaultValue={deal.title} pattern={NOT_BLANK} title="Add a project title" required />
        </label>
      </section>

      <MilestoneFields initial={initial} submitLabel="Save changes" busyLabel="Saving…" />
    </form>
  );
}
