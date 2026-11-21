import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createDeal } from "../actions";

export default async function NewDeal() {
  if (!(await currentUser())) redirect("/");
  return (
    <form action={createDeal} className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">New protected deal</h1>
      <p className="text-black/60">You're the freelancer. Agree what "delivered" means per milestone, then send the link to your client.</p>
      <input className="input text-lg" name="title" placeholder="Project, e.g. Shopify store for Meera's brand" required />
      {[0, 1].map((i) => (
        <div key={i} className="card space-y-2">
          <div className="label">Milestone {i + 1}{i ? " (optional)" : ""}</div>
          <div className="grid gap-2 md:grid-cols-[1fr_140px_120px]">
            <input className="input" name="m_title" placeholder="Title" required={!i} />
            <input className="input" name="m_amount" type="number" min="1" placeholder="₹ amount" required={!i} />
            <input className="input" name="m_due" type="number" min="1" placeholder="Due in days" defaultValue={7} />
          </div>
          <textarea className="input min-h-24" name="m_checklist" placeholder={"Delivered means (one per line)\nHomepage live on staging URL\n3 product pages"} required={!i} />
        </div>
      ))}
      <button className="btn">Create Pakka link</button>
    </form>
  );
}
