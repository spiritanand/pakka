import { db, logActivity, logEvent } from "@/lib/db";
import { auth, ensureMigrated } from "@/lib/auth";
import { createDeal } from "@/lib/deals";

export const DEMO_PASSWORD = "pakka1234";

const PEOPLE = [
  { key: "meera", name: "Meera", pan: "AAKPM1234C", gstin: "29AAKPM1234C1ZZ", phone: "9800000001" },
  { key: "rohan", name: "Rohan", pan: "BQRPR5678K", gstin: "", phone: "9800000002" },
  { key: "priya", name: "Priya", pan: "CHVPP4321L", gstin: "27CHVPP4321L1ZO", phone: "9800000003" },
  { key: "arjun", name: "Arjun", pan: "DKLPA8765M", gstin: "", phone: "9800000004" },
];
const CLIENTS = ["Kavya", "Nikhil", "Sana", "Imran", "Divya", "Farhan", "Leela"];

const DAY = 86400_000;

const DEMO_USERS = `select id from user where email like '%@pakka.demo'`;
const DEMO_DEALS = `select id from deals where freelancer_id in (${DEMO_USERS}) or client_id in (${DEMO_USERS}) or created_by in (${DEMO_USERS})`;
const DEMO_MILESTONES = `select id from milestones where deal_id in (${DEMO_DEALS})`;

// Only demo accounts and their deals are wiped, so real sign-ups survive a reset.
function wipeDemo() {
  db.exec(`
    delete from events where milestone_id in (${DEMO_MILESTONES}) or user_id in (${DEMO_USERS}) or counterparty_id in (${DEMO_USERS});
    delete from activity where milestone_id in (${DEMO_MILESTONES});
    delete from score_changes where milestone_id in (${DEMO_MILESTONES}) or user_id in (${DEMO_USERS});
    delete from vouches where voucher_id in (${DEMO_USERS}) or vouchee_id in (${DEMO_USERS});
    delete from milestones where deal_id in (${DEMO_DEALS});
    delete from deals where id in (${DEMO_DEALS});
    delete from session where userId in (${DEMO_USERS});
    delete from account where userId in (${DEMO_USERS});
    delete from user where email like '%@pakka.demo';
  `);
}

export async function seedDemo() {
  await ensureMigrated();
  wipeDemo();

  const ids: Record<string, string> = {};
  for (const p of PEOPLE) {
    const r = await auth.api.signUpEmail({
      body: { name: p.name, email: `${p.key}@pakka.demo`, password: DEMO_PASSWORD, phone: p.phone, pan: p.pan, gstin: p.gstin },
    });
    ids[p.key] = r.user.id;
  }
  for (const c of CLIENTS) {
    const r = await auth.api.signUpEmail({
      body: { name: c, email: `${c.toLowerCase()}@pakka.demo`, password: DEMO_PASSWORD },
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

  const showcase = (
    freelancer: string,
    client: string,
    title: string,
    milestones: { title: string; amount: number; checklist: string[]; state: string; round?: number; rejected?: number[] }[],
  ) => {
    const s = createDeal({
      freelancerId: ids[freelancer],
      title,
      milestones: milestones.map((m, i) => ({ title: m.title, amount: m.amount, checklist: m.checklist, dueDays: 4 + i * 5 })),
    });
    const dealId = (db.prepare(`select id from deals where slug = ?`).get(s) as { id: string }).id;
    db.prepare(`update deals set client_id = ?, created_at = ? where id = ?`).run(ids[client], now - 6 * DAY, dealId);
    const rows = db.prepare(`select id, checklist, amount from milestones where deal_id = ? order by idx`).all(dealId) as { id: string; checklist: string; amount: number }[];
    rows.forEach((r, i) => {
      const m = milestones[i];
      if (m.state === "AGREED") return;
      const all = JSON.parse(r.checklist).map((_: string, k: number) => k);
      db.prepare(
        `update milestones set state = ?, round = ?, payment_id = ?, transfer_id = ?, evidence_url = ?, evidence_ticks = ?,
         rejected_items = ?, review_due_at = ?, outcome = ? where id = ?`,
      ).run(
        m.state,
        m.round ?? 1,
        `pay_seed${i}${r.id.slice(0, 6)}`,
        `trf_seed${i}${r.id.slice(0, 6)}`,
        m.state === "FUNDED" ? null : "https://www.figma.com/file/seed-deliverable",
        m.state === "FUNDED" ? null : JSON.stringify(all),
        m.rejected ? JSON.stringify(m.rejected) : null,
        m.state === "SUBMITTED" ? now + 50 * 3600_000 : null,
        m.state === "RELEASED" ? "accepted" : null,
        r.id,
      );
      const pay = `pay_seed${i}${r.id.slice(0, 6)}`;
      const trf = `trf_seed${i}${r.id.slice(0, 6)}`;
      const at = now - (5 - i * 2) * DAY;
      const base = { amount: r.amount, milestone_id: r.id };
      logEvent({ ...base, user_id: ids[client], type: "FUNDED", counterparty_id: ids[freelancer], ref: pay, created_at: at });
      const work = { milestone_id: r.id, user_id: ids[freelancer], type: "SUBMITTED" as const, detail: "https://www.figma.com/file/seed-deliverable" };
      const sendBack = (items: number[], t: number) =>
        logActivity({ milestone_id: r.id, user_id: ids[client], type: "SENT_BACK", detail: JSON.stringify(items), created_at: t });
      if (m.state === "RELEASED") logActivity({ ...work, created_at: at + DAY - 5 * 3600_000 });
      if (m.state === "SUBMITTED") logActivity({ ...work, created_at: now - 22 * 3600_000 });
      if (m.state === "DISPUTED") {
        logActivity({ ...work, created_at: at + DAY });
        sendBack(m.rejected ?? [], at + 1.5 * DAY);
        logActivity({ ...work, created_at: at + 2.5 * DAY });
        sendBack(m.rejected ?? [], at + 3 * DAY);
      }
      if (m.state === "RELEASED") {
        logEvent({ ...base, user_id: ids[freelancer], type: "DELIVERED", counterparty_id: ids[client], ref: trf, created_at: at + DAY });
        logEvent({ ...base, user_id: ids[client], type: "ACCEPTED", counterparty_id: ids[freelancer], ref: trf, created_at: at + DAY });
      }
    });
    return s;
  };
  showcase("priya", "Kavya", "Brand identity for Kavya's bakery", [
    { title: "Logo directions", amount: 18000, state: "RELEASED", checklist: ["3 logo directions as PNG + SVG", "Colour palette with hex codes"] },
    { title: "Packaging + menu", amount: 22000, state: "SUBMITTED", checklist: ["Box and bag artwork print-ready", "Menu card in A4 and A5", "Editable Figma source shared"] },
  ]);
  showcase("arjun", "Nikhil", "Launch copy for Nikhil's invoicing app", [
    { title: "Landing page copy", amount: 9000, state: "FUNDED", checklist: ["Hero, features and FAQ copy", "Two headline options"] },
    { title: "Launch email sequence", amount: 6000, state: "AGREED", checklist: ["3 emails, plain text", "Subject line variants"] },
  ]);
  showcase("priya", "Sana", "Product photos retouch for Sana's store", [
    { title: "40 product photos", amount: 12000, state: "DISPUTED", round: 3, rejected: [1], checklist: ["40 images, white background", "Consistent shadows across set"] },
  ]);

  const menu = createDeal({
    clientId: ids.Kavya,
    title: "Menu photos for Kavya's bakery",
    milestones: [
      { title: "Menu shoot", amount: 8000, dueDays: 5, checklist: ["12 dishes on a plain background", "Edited JPGs at full size", "Square crops for Instagram"] },
    ],
  });
  // Older than the bakery deal so Kavya's review stays at the top of her dashboard.
  db.prepare(`update deals set created_at = created_at - ? where slug = ?`).run(7 * DAY, menu);
  db.prepare(`update milestones set due_at = due_at - ? where deal_id = (select id from deals where slug = ?)`).run(7 * DAY, menu);

  return { deal: `/d/${slug}`, logins: PEOPLE.map((p) => `${p.key}@pakka.demo`), password: DEMO_PASSWORD };
}
