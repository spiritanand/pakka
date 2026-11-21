import { nanoid } from "nanoid";
import { db, logEvent, type Deal, type Milestone } from "./db";
import { rzp } from "./rzp";

const HOUR = 3600_000;
export const REVIEW_WINDOW = 72 * HOUR;

export function getDealBySlug(slug: string) {
  return db.prepare(`select * from deals where slug = ?`).get(slug) as Deal | undefined;
}

export function getMilestones(dealId: string) {
  return db.prepare(`select * from milestones where deal_id = ? order by idx`).all(dealId) as Milestone[];
}

export function getMilestone(id: string) {
  return db.prepare(`select * from milestones where id = ?`).get(id) as Milestone | undefined;
}

function dealOf(m: Milestone) {
  return db.prepare(`select * from deals where id = ?`).get(m.deal_id) as Deal;
}

function claim(id: string, from: string, to: string, extra = "") {
  return db.prepare(`update milestones set state = ? ${extra} where id = ? and state = ?`).run(to, id, from).changes === 1;
}

export function createDeal(p: {
  freelancerId: string;
  title: string;
  milestones: { title: string; amount: number; checklist: string[]; dueDays: number }[];
}) {
  const id = nanoid();
  const slug = nanoid(8);
  db.prepare(`insert into deals (id, slug, title, freelancer_id, created_at) values (?, ?, ?, ?, ?)`).run(
    id, slug, p.title, p.freelancerId, Date.now(),
  );
  p.milestones.forEach((m, idx) =>
    db.prepare(
      `insert into milestones (id, deal_id, idx, title, amount, checklist, due_at) values (?, ?, ?, ?, ?, ?, ?)`,
    ).run(nanoid(), id, idx, m.title, Math.round(m.amount * 100), JSON.stringify(m.checklist), Date.now() + m.dueDays * 24 * HOUR),
  );
  return slug;
}

export async function startFunding(milestoneId: string, clientId: string, appUrl: string) {
  const m = getMilestone(milestoneId);
  if (!m || m.state !== "AGREED") throw new Error("Milestone is not awaiting funding");
  const deal = dealOf(m);
  if (deal.freelancer_id === clientId) throw new Error("You can't fund your own deal");
  if (deal.client_id && deal.client_id !== clientId) throw new Error("Another client owns this deal");
  db.prepare(`update deals set client_id = ? where id = ?`).run(clientId, deal.id);
  const link = await rzp.createPaymentLink({
    amount: m.amount,
    description: `Pakka · ${deal.title} · ${m.title}`.slice(0, 2048),
    reference_id: `${m.id}-${Date.now()}`.slice(0, 40),
    callback_url: `${appUrl}/api/rzp/callback?m=${m.id}`,
  });
  db.prepare(`update milestones set link_id = ? where id = ?`).run(link.id, m.id);
  return link.short_url;
}

export async function confirmFunding(milestoneId: string) {
  const m = getMilestone(milestoneId);
  if (!m?.link_id) throw new Error("No payment link for milestone");
  if (m.state !== "AGREED") return dealOf(m).slug;
  const link = await rzp.getPaymentLink(m.link_id);
  const paid = link.payments?.find((p) => p.status === "captured");
  if (link.status !== "paid" || !paid) throw new Error(`Payment link status: ${link.status}`);
  if (!claim(m.id, "AGREED", "FUNDING")) return dealOf(m).slug;
  try {
    const t = await rzp.holdTransfer(paid.payment_id, m.amount, { milestone: m.id });
    const transferId = t.items[0].id;
    db.prepare(`update milestones set state = 'FUNDED', payment_id = ?, transfer_id = ? where id = ?`).run(
      paid.payment_id, transferId, m.id,
    );
    const deal = dealOf(m);
    logEvent({ user_id: deal.client_id!, type: "FUNDED", amount: m.amount, counterparty_id: deal.freelancer_id, milestone_id: m.id, ref: paid.payment_id });
  } catch (e) {
    db.prepare(`update milestones set state = 'AGREED' where id = ?`).run(m.id);
    throw e;
  }
  return dealOf(m).slug;
}

export function submitWork(milestoneId: string, userId: string, url: string, ticks: number[]) {
  const m = getMilestone(milestoneId)!;
  const deal = dealOf(m);
  if (deal.freelancer_id !== userId) throw new Error("Only the freelancer can submit");
  const checklist = JSON.parse(m.checklist) as string[];
  if (ticks.length !== checklist.length) throw new Error("Attach evidence for every checklist item");
  const ok = db
    .prepare(
      `update milestones set state = 'SUBMITTED', evidence_url = ?, evidence_ticks = ?, review_due_at = ?, rejected_items = null
       where id = ? and state = 'FUNDED'`,
    )
    .run(url, JSON.stringify(ticks), Date.now() + REVIEW_WINDOW, m.id).changes;
  if (!ok) throw new Error("Milestone is not open for submission");
}

async function settleRelease(m: Milestone, auto: boolean) {
  const deal = dealOf(m);
  if (!claim(m.id, "SUBMITTED", "RELEASING")) return;
  try {
    await rzp.release(m.transfer_id!);
  } catch (e) {
    db.prepare(`update milestones set state = 'SUBMITTED' where id = ?`).run(m.id);
    throw e;
  }
  db.prepare(`update milestones set state = 'RELEASED', outcome = ? where id = ?`).run(auto ? "auto_released" : "accepted", m.id);
  logEvent({ user_id: deal.freelancer_id, type: "DELIVERED", amount: m.amount, counterparty_id: deal.client_id, milestone_id: m.id, ref: m.transfer_id });
  logEvent({ user_id: deal.client_id!, type: auto ? "AUTO_RELEASED" : "ACCEPTED", amount: m.amount, counterparty_id: deal.freelancer_id, milestone_id: m.id, ref: m.transfer_id });
}

async function settleGhost(m: Milestone) {
  const deal = dealOf(m);
  if (!claim(m.id, "FUNDED", "REFUNDING")) return;
  let refundId: string;
  try {
    const t = await rzp.getTransfer(m.transfer_id!);
    const left = t.amount - (t.amount_reversed ?? 0);
    if (left > 0) await rzp.reverse(m.transfer_id!, left);
    refundId = (await rzp.refund(m.payment_id!, m.amount)).id;
  } catch (e) {
    db.prepare(`update milestones set state = 'FUNDED' where id = ?`).run(m.id);
    throw e;
  }
  db.prepare(`update milestones set state = 'REFUNDED', outcome = 'ghosted', refund_id = ? where id = ?`).run(refundId, m.id);
  logEvent({ user_id: deal.freelancer_id, type: "GHOSTED", amount: m.amount, counterparty_id: deal.client_id, milestone_id: m.id, ref: refundId });
  logEvent({ user_id: deal.client_id!, type: "REFUNDED", amount: m.amount, counterparty_id: deal.freelancer_id, milestone_id: m.id, ref: refundId });
}

export async function accept(milestoneId: string, userId: string) {
  const m = getMilestone(milestoneId)!;
  if (dealOf(m).client_id !== userId) throw new Error("Only the client can accept");
  await settleRelease(m, false);
}

export function reject(milestoneId: string, userId: string, failed: number[]) {
  const m = getMilestone(milestoneId)!;
  if (dealOf(m).client_id !== userId) throw new Error("Only the client can reject");
  if (!failed.length) throw new Error("Tick the checklist item(s) that were not delivered");
  const next = m.round >= 2 ? "DISPUTED" : "FUNDED";
  db.prepare(
    `update milestones set state = ?, round = round + 1, rejected_items = ?, due_at = ? where id = ? and state = 'SUBMITTED'`,
  ).run(next, JSON.stringify(failed), Date.now() + 48 * HOUR, m.id);
}

export async function fastForward(milestoneId: string) {
  const shift = REVIEW_WINDOW + HOUR;
  db.prepare(
    `update milestones set due_at = due_at - ?, review_due_at = case when review_due_at is null then null else review_due_at - ? end where id = ?`,
  ).run(shift, shift, milestoneId);
  await tick(getMilestone(milestoneId)!);
}

async function tick(m: Milestone) {
  const now = Date.now();
  if (m.state === "FUNDED" && now > m.due_at) await settleGhost(m);
  else if (m.state === "SUBMITTED" && m.review_due_at && now > m.review_due_at) await settleRelease(m, true);
}
