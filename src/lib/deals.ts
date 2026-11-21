import { nanoid } from "nanoid";
import { db, logActivity, logEvent, type Deal, type Milestone, type ScoreChange } from "./db";
import { rzp } from "./rzp";
import { trustScore } from "./score";

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

type Terms = { title: string; milestones: { title: string; amount: number; checklist: string[]; dueDays: number }[] };

export const createdByClient = (deal: Pick<Deal, "created_by" | "client_id">) => !!deal.client_id && deal.created_by === deal.client_id;

export function createDeal(p: Terms & ({ freelancerId: string; clientId?: never } | { clientId: string; freelancerId?: never })) {
  const id = nanoid();
  const slug = nanoid(8);
  const creator = p.freelancerId ?? p.clientId;
  db.prepare(`insert into deals (id, slug, title, freelancer_id, client_id, created_by, created_at) values (?, ?, ?, ?, ?, ?, ?)`).run(
    id, slug, p.title, p.freelancerId ?? null, p.clientId ?? null, creator, Date.now(),
  );
  p.milestones.forEach((m, idx) =>
    db.prepare(
      `insert into milestones (id, deal_id, idx, title, amount, checklist, due_at) values (?, ?, ?, ?, ?, ?, ?)`,
    ).run(nanoid(), id, idx, m.title, Math.round(m.amount * 100), JSON.stringify(m.checklist), Date.now() + m.dueDays * 24 * HOUR),
  );
  return slug;
}

export function isEditable(dealId: string) {
  const deal = db.prepare(`select * from deals where id = ?`).get(dealId) as Deal | undefined;
  if (!deal || (createdByClient(deal) ? deal.freelancer_id : deal.client_id)) return false;
  const busy = db
    .prepare(`select count(*) n from milestones where deal_id = ? and (state != 'AGREED' or link_id is not null or funder_id is not null)`)
    .get(dealId) as { n: number };
  return busy.n === 0;
}

export function updateDeal(p: Terms & { slug: string; userId: string }) {
  const deal = getDealBySlug(p.slug);
  if (!deal || deal.created_by !== p.userId) throw new Error("Only the person who made this deal can edit it");
  db.transaction(() => {
    if (!isEditable(deal.id)) throw new Error("This deal can't be edited once the other side has joined");
    db.prepare(`update deals set title = ? where id = ?`).run(p.title, deal.id);
    db.prepare(`delete from milestones where deal_id = ?`).run(deal.id);
    p.milestones.forEach((m, idx) =>
      db.prepare(
        `insert into milestones (id, deal_id, idx, title, amount, checklist, due_at) values (?, ?, ?, ?, ?, ?, ?)`,
      ).run(nanoid(), deal.id, idx, m.title, Math.round(m.amount * 100), JSON.stringify(m.checklist), deal.created_at + m.dueDays * 24 * HOUR),
    );
  })();
  return deal.slug;
}

export function termsKey(dealId: string) {
  return getMilestones(dealId).map((m) => m.id).join(".");
}

export type JoinResult = "ok" | "own" | "changed" | "taken";

export function joinDeal(slug: string, userId: string, terms: string): JoinResult {
  const deal = getDealBySlug(slug);
  if (!deal) return "taken";
  if (deal.freelancer_id === userId) return "ok";
  if (deal.client_id === userId) return "own";
  if (deal.freelancer_id || !createdByClient(deal)) return "taken";
  return db.transaction((): JoinResult => {
    if (termsKey(deal.id) !== terms) return "changed";
    const n = db.prepare(`update deals set freelancer_id = ? where id = ? and freelancer_id is null and client_id != ?`).run(userId, deal.id, userId).changes;
    return n ? "ok" : "taken";
  })();
}

export async function startFunding(milestoneId: string, clientId: string, appUrl: string) {
  const m = getMilestone(milestoneId);
  if (!m || m.state !== "AGREED") throw new Error("Milestone is not awaiting funding");
  const deal = dealOf(m);
  if (createdByClient(deal) && !deal.freelancer_id) throw new Error("A freelancer has to accept this deal before it can be funded");
  if (deal.freelancer_id === clientId) throw new Error("You can't fund your own deal");
  if (deal.client_id && deal.client_id !== clientId) throw new Error("Another client owns this deal");
  if (m.link_id) {
    const old = await rzp.getPaymentLink(m.link_id);
    if (old.status === "paid") {
      await confirmFunding(m.id);
      return `${appUrl}/d/${deal.slug}`;
    }
    if (old.status === "created" || old.status === "partially_paid") {
      if (m.funder_id === clientId) return old.short_url;
      await rzp.cancelPaymentLink(m.link_id).catch(() => {});
    }
  }
  const link = await rzp.createPaymentLink({
    amount: m.amount,
    description: `Pakka · ${deal.title} · ${m.title}`.slice(0, 2048),
    reference_id: `${m.id}-${Date.now()}`.slice(0, 40),
    callback_url: `${appUrl}/api/rzp/callback?m=${m.id}`,
  });
  db.prepare(`update milestones set link_id = ?, funder_id = ? where id = ?`).run(link.id, clientId, m.id);
  return link.short_url;
}

export async function confirmFunding(milestoneId: string) {
  const m = getMilestone(milestoneId);
  if (!m?.link_id) throw new Error("No payment link for milestone");
  if (m.state !== "AGREED") return dealOf(m).slug;
  const link = await rzp.getPaymentLink(m.link_id);
  const paid = link.payments?.find((p) => p.status === "captured");
  if (link.status !== "paid" || !paid) throw new Error(`Payment link status: ${link.status}`);
  const funder = m.funder_id ?? dealOf(m).client_id;
  if (!funder) throw new Error("No funder recorded for milestone");
  if (!claim(m.id, "AGREED", "FUNDING")) return dealOf(m).slug;
  const bound = db
    .prepare(`update deals set client_id = ? where id = ? and (client_id is null or client_id = ?)`)
    .run(funder, m.deal_id, funder).changes;
  if (!bound) {
    try {
      await rzp.refund(paid.payment_id, m.amount);
    } catch (e) {
      db.prepare(`update milestones set state = 'AGREED' where id = ?`).run(m.id);
      throw e;
    }
    db.prepare(`update milestones set state = 'AGREED', link_id = null, funder_id = null where id = ?`).run(m.id);
    throw new Error("Another client already funded this deal, so this payment was refunded");
  }
  try {
    const t = await rzp.holdTransfer(paid.payment_id, m.amount, { milestone: m.id });
    const transferId = t.items[0].id;
    const deal = dealOf(m);
    db.prepare(`update milestones set state = 'FUNDED', payment_id = ?, transfer_id = ?, due_at = due_at + ? where id = ?`).run(
      paid.payment_id, transferId, Math.max(0, Date.now() - deal.created_at), m.id,
    );
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
  logActivity({ milestone_id: m.id, user_id: userId, type: "SUBMITTED", detail: url });
}

function affected(deal: Deal) {
  const people = new Map<string, string>();
  if (deal.client_id) people.set(deal.client_id, "client");
  if (!deal.freelancer_id) return people;
  people.set(deal.freelancer_id, "freelancer");
  const vouchers = db.prepare(`select voucher_id from vouches where vouchee_id = ?`).all(deal.freelancer_id) as { voucher_id: string }[];
  const nameOf = (id: string) => (db.prepare(`select name from user where id = ?`).get(id) as { name: string }).name.split(" (")[0];
  const freelancerName = nameOf(deal.freelancer_id);
  for (const { voucher_id } of vouchers) {
    if (!people.has(voucher_id)) people.set(voucher_id, `vouched for ${freelancerName}`);
    const others = db.prepare(`select vouchee_id from vouches where voucher_id = ?`).all(voucher_id) as { vouchee_id: string }[];
    for (const { vouchee_id } of others) if (!people.has(vouchee_id)) people.set(vouchee_id, `vouched for by ${nameOf(voucher_id)}`);
  }
  return people;
}

function snapshot(deal: Deal) {
  const people = affected(deal);
  const before = new Map([...people.keys()].map((id) => [id, trustScore(id).score]));
  return (milestoneId: string) => {
    for (const [id, reason] of people) {
      const after = trustScore(id).score;
      db.prepare(
        `insert into score_changes (milestone_id, user_id, before, after, reason, created_at) values (?, ?, ?, ?, ?, ?)`,
      ).run(milestoneId, id, before.get(id)!, after, reason, Date.now());
    }
  };
}

export function scoreChanges(milestoneId: string) {
  return db
    .prepare(`select s.*, u.name from score_changes s join user u on u.id = s.user_id where milestone_id = ? order by abs(after - before) desc`)
    .all(milestoneId) as (ScoreChange & { name: string })[];
}

function parties(deal: Deal) {
  if (!deal.freelancer_id || !deal.client_id) throw new Error("This deal is missing a freelancer or a client");
  return { freelancer: deal.freelancer_id, client: deal.client_id };
}

async function settleRelease(m: Milestone, auto: boolean) {
  const deal = dealOf(m);
  const p = parties(deal);
  if (!claim(m.id, "SUBMITTED", "RELEASING")) return;
  try {
    await rzp.release(m.transfer_id!);
  } catch (e) {
    db.prepare(`update milestones set state = 'SUBMITTED' where id = ?`).run(m.id);
    throw e;
  }
  const record = snapshot(deal);
  db.prepare(`update milestones set state = 'RELEASED', outcome = ? where id = ?`).run(auto ? "auto_released" : "accepted", m.id);
  logEvent({ user_id: p.freelancer, type: "DELIVERED", amount: m.amount, counterparty_id: p.client, milestone_id: m.id, ref: m.transfer_id });
  logEvent({ user_id: p.client, type: auto ? "AUTO_RELEASED" : "ACCEPTED", amount: m.amount, counterparty_id: p.freelancer, milestone_id: m.id, ref: m.transfer_id });
  record(m.id);
}

async function settleGhost(m: Milestone) {
  const deal = dealOf(m);
  const p = parties(deal);
  if (!claim(m.id, "FUNDED", "REFUNDING")) return;
  let refundId: string;
  try {
    refundId = (await rzp.refundReverseAll(m.payment_id!, m.amount)).id;
  } catch (e) {
    db.prepare(`update milestones set state = 'FUNDED' where id = ?`).run(m.id);
    throw e;
  }
  const record = snapshot(deal);
  db.prepare(`update milestones set state = 'REFUNDED', outcome = 'ghosted', refund_id = ? where id = ?`).run(refundId, m.id);
  logEvent({ user_id: p.freelancer, type: "GHOSTED", amount: m.amount, counterparty_id: p.client, milestone_id: m.id, ref: refundId });
  logEvent({ user_id: p.client, type: "REFUNDED", amount: m.amount, counterparty_id: p.freelancer, milestone_id: m.id, ref: refundId });
  record(m.id);
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
  const ok = db.prepare(
    `update milestones set state = ?, round = round + 1, rejected_items = ?, due_at = ? where id = ? and state = 'SUBMITTED'`,
  ).run(next, JSON.stringify(failed), Date.now() + 48 * HOUR, m.id).changes;
  if (ok) logActivity({ milestone_id: m.id, user_id: userId, type: "SENT_BACK", detail: JSON.stringify(failed) });
}

const isDemoUser = (id: string | null) =>
  !!id && !!(db.prepare(`select 1 from user where id = ? and email like '%@pakka.demo'`).get(id));

export function canFastForward(deal: Deal) {
  if (process.env.ENABLE_DEMO_FASTFORWARD === "1") return true;
  return isDemoUser(deal.freelancer_id) && isDemoUser(deal.client_id);
}

export async function fastForward(milestoneId: string, userId: string) {
  const past = Date.now() - 1000;
  const m = getMilestone(milestoneId);
  if (!m) throw new Error("Milestone not found");
  const deal = dealOf(m);
  if (userId !== deal.client_id && userId !== deal.freelancer_id) throw new Error("Only the client or freelancer can do this");
  if (!canFastForward(deal)) throw new Error("Fast-forward is only available on demo deals");
  if (m.state === "FUNDED") db.prepare(`update milestones set due_at = ? where id = ?`).run(past, m.id);
  if (m.state === "SUBMITTED") db.prepare(`update milestones set review_due_at = ? where id = ?`).run(past, m.id);
  await tick(getMilestone(milestoneId)!);
}

export async function tickDue() {
  const now = Date.now();
  const due = db
    .prepare(
      `select * from milestones
       where ((state = 'FUNDED' and due_at < ?) or (state = 'SUBMITTED' and review_due_at < ?))
         and payment_id not like 'pay_seed%'`,
    )
    .all(now, now) as Milestone[];
  let settled = 0;
  for (const m of due) await tick(m).then(() => settled++, (e) => console.error("tick", m.id, e));
  return { due: due.length, settled };
}

async function tick(m: Milestone) {
  const now = Date.now();
  if (m.state === "FUNDED" && now > m.due_at) await settleGhost(m);
  else if (m.state === "SUBMITTED" && m.review_due_at && now > m.review_due_at) await settleRelease(m, true);
}
