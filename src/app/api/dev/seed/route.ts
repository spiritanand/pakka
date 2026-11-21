import { NextResponse } from "next/server";
import { db, logEvent } from "@/lib/db";
import { auth, ensureMigrated } from "@/lib/auth";
import { createDeal } from "@/lib/deals";

const DEMO_PASSWORD = "pakka1234";

const PEOPLE = [
  { key: "meera", name: "Meera (D2C founder)", pan: "AAKPM1234C", gstin: "29AAKPM1234C1ZZ", phone: "9800000001" },
  { key: "rohan", name: "Rohan (Shopify dev)", pan: "BQRPR5678K", gstin: "", phone: "9800000002" },
  { key: "priya", name: "Priya (design studio)", pan: "CHVPP4321L", gstin: "27CHVPP4321L1ZO", phone: "9800000003" },
  { key: "arjun", name: "Arjun (copywriter)", pan: "DKLPA8765M", gstin: "", phone: "9800000004" },
];
const CLIENTS = ["Kavya", "Nikhil", "Sana", "Imran", "Divya", "Farhan", "Leela"];

const DAY = 86400_000;

export async function POST() {
  await ensureMigrated();
  db.exec(`delete from events; delete from vouches; delete from milestones; delete from deals;
           delete from session; delete from account; delete from verification; delete from user;`);

  const ids: Record<string, string> = {};
  for (const p of PEOPLE) {
    const r = await auth.api.signUpEmail({
      body: { name: p.name, email: `${p.key}@pakka.demo`, password: DEMO_PASSWORD, phone: p.phone, pan: p.pan, gstin: p.gstin },
    });
    ids[p.key] = r.user.id;
  }
  for (const c of CLIENTS) {
    const r = await auth.api.signUpEmail({
      body: { name: `${c} (client)`, email: `${c.toLowerCase()}@pakka.demo`, password: DEMO_PASSWORD },
    });
    ids[c] = r.user.id;
  }

  const now = Date.now();
  const history = (who: string, deals: number, avg: number) => {
    for (let i = 0; i < deals; i++) {
      const client = ids[CLIENTS[i % CLIENTS.length]];
      const amount = Math.round(avg * (0.6 + ((i * 37) % 80) / 100)) * 100;
      const at = now - (200 - i * 7) * DAY;
      logEvent({ user_id: ids[who], type: "DELIVERED", amount, counterparty_id: client, milestone_id: null, ref: "seed", created_at: at });
      logEvent({ user_id: client, type: "ACCEPTED", amount, counterparty_id: ids[who], milestone_id: null, ref: "seed", created_at: at });
    }
  };
  history("priya", 20, 18000);
  history("arjun", 6, 9000);
  for (let i = 0; i < 5; i++) {
    const at = now - (120 - i * 10) * DAY;
    logEvent({ user_id: ids.meera, type: "ACCEPTED", amount: 1200000, counterparty_id: ids[CLIENTS[i]], milestone_id: null, ref: "seed", created_at: at });
  }
  db.prepare(`insert into vouches (voucher_id, vouchee_id, note, created_at) values (?, ?, ?, ?)`).run(
    ids.priya, ids.arjun, "Wrote copy for 4 of our client launches. Always on time.", now - 90 * DAY,
  );

  const slug = createDeal({
    freelancerId: ids.rohan,
    title: "Shopify store for Meera's skincare brand",
    milestones: [
      { title: "Homepage + product pages", amount: 15000, dueDays: 5, checklist: ["Homepage live on staging URL", "3 product pages with variants", "Mobile layout checked on 2 phones"] },
      { title: "Checkout + launch", amount: 25000, dueDays: 10, checklist: ["Razorpay checkout working", "Shipping rules for 3 zones", "Store live on custom domain"] },
    ],
  });

  return NextResponse.json({ ok: true, deal: `/d/${slug}`, logins: PEOPLE.map((p) => `${p.key}@pakka.demo`), password: DEMO_PASSWORD });
}
