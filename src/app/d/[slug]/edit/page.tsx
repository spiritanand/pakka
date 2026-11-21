import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createdByClient, getDealBySlug, getMilestones, isEditable } from "@/lib/deals";
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
  lockedJoined: () => "A freelancer has accepted, so this deal can't be changed any more.",
};

export default async function EditDeal({ params, searchParams }: PageProps<"/d/[slug]/edit">) {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) notFound();
  const u = await currentUser();
  if (!u) redirect(`/login?mode=signin&next=/d/${slug}/edit`);
  if (u.id !== deal.created_by) redirect(`/d/${slug}`);
  const paying = createdByClient(deal);
  const sp = await searchParams;
  const code = sp.error === "locked" && paying ? "lockedJoined" : sp.error;
  const error = typeof code === "string" ? ERRORS[code]?.(typeof sp.m === "string" ? sp.m.replace(/\D/g, "") : "") : undefined;
  if (!isEditable(deal.id) && !error) redirect(`/d/${slug}`);
  const initial = getMilestones(deal.id).map((m) => ({
    title: m.title,
    amount: String(m.amount / 100),
    checklist: (JSON.parse(m.checklist) as string[]).join("\n"),
    due: Math.max(1, Math.round((m.due_at - deal.created_at) / DAY)),
  }));
  return (
    <form action={updateDeal} data-role={paying ? "client" : "freelancer"}>
      <input type="hidden" name="slug" value={slug} />
      <header className="max-w-2xl pb-10">
        <BackLink href={`/d/${slug}`} label="Back to deal" className="mb-6" />
        <h1 className="text-title">Edit deal</h1>
        <p className="mt-3 text-ink-2">
          {paying ? "You can change anything until a freelancer accepts." : "You can change anything until your client starts paying."}
        </p>
        {error ? <p role="alert" className="mt-6 border-l-2 border-rose-600 pl-3 text-sm text-rose-700">{error}</p> : null}
      </header>

      <section className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-medium">Project</h2>
          <p className="mt-1 text-meta text-muted">
            {paying ? "The freelancer sees this at the top of the link." : "Your client sees this at the top of the link."}
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="label block">Project title</span>
          <input className="input" name="title" defaultValue={deal.title} pattern={NOT_BLANK} title="Add a project title" required />
        </label>
      </section>

      <MilestoneFields initial={initial} submitLabel="Save changes" busyLabel="Saving…" />
    </form>
  );
}
