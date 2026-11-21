import Database from "better-sqlite3";

const g = globalThis as unknown as { __pakkaDb?: Database.Database };

export const db = g.__pakkaDb ?? new Database(process.env.DB_PATH ?? "pakka.db");
g.__pakkaDb = db;
db.pragma("journal_mode = WAL");

db.exec(`
create table if not exists deals (
  id text primary key,
  slug text unique not null,
  title text not null,
  freelancer_id text not null,
  client_id text,
  created_at integer not null
);
create table if not exists milestones (
  id text primary key,
  deal_id text not null,
  idx integer not null,
  title text not null,
  amount integer not null,
  checklist text not null,
  due_at integer not null,
  review_due_at integer,
  state text not null default 'AGREED',
  round integer not null default 1,
  outcome text,
  evidence_url text,
  evidence_ticks text,
  rejected_items text,
  link_id text,
  payment_id text,
  transfer_id text,
  refund_id text
);
create table if not exists events (
  id integer primary key autoincrement,
  user_id text not null,
  type text not null,
  amount integer not null default 0,
  counterparty_id text,
  milestone_id text,
  ref text,
  created_at integer not null
);
create table if not exists vouches (
  id integer primary key autoincrement,
  voucher_id text not null,
  vouchee_id text not null,
  note text,
  created_at integer not null,
  unique(voucher_id, vouchee_id)
);
`);

if (!(db.prepare(`pragma table_info(milestones)`).all() as { name: string }[]).some((c) => c.name === "funder_id")) {
  db.exec(`alter table milestones add column funder_id text`);
}

export type Deal = {
  id: string; slug: string; title: string; freelancer_id: string; client_id: string | null; created_at: number;
};
export type Milestone = {
  id: string; deal_id: string; idx: number; title: string; amount: number; checklist: string;
  due_at: number; review_due_at: number | null; state: MilestoneState; round: number; outcome: string | null;
  evidence_url: string | null; evidence_ticks: string | null; rejected_items: string | null;
  link_id: string | null; funder_id: string | null; payment_id: string | null; transfer_id: string | null; refund_id: string | null;
};
export type MilestoneState = "AGREED" | "FUNDED" | "SUBMITTED" | "RELEASED" | "REFUNDED" | "DISPUTED";
export type EventRow = {
  id: number; user_id: string; type: EventType; amount: number; counterparty_id: string | null;
  milestone_id: string | null; ref: string | null; created_at: number;
};
export type EventType = "FUNDED" | "DELIVERED" | "ACCEPTED" | "AUTO_RELEASED" | "GHOSTED" | "REFUNDED";
export type Vouch = { id: number; voucher_id: string; vouchee_id: string; note: string | null; created_at: number };
export type User = {
  id: string; name: string; email: string; phone: string | null; pan: string | null; gstin: string | null;
};

export function logEvent(e: Omit<EventRow, "id" | "created_at"> & { created_at?: number }) {
  db.prepare(
    `insert into events (user_id, type, amount, counterparty_id, milestone_id, ref, created_at)
     values (@user_id, @type, @amount, @counterparty_id, @milestone_id, @ref, @created_at)`,
  ).run({ ...e, created_at: e.created_at ?? Date.now() });
}

export function getUser(id: string) {
  return db.prepare(`select id, name, email, phone, pan, gstin from user where id = ?`).get(id) as User | undefined;
}

db.exec(`
create table if not exists score_changes (
  id integer primary key autoincrement,
  milestone_id text not null,
  user_id text not null,
  before integer not null,
  after integer not null,
  reason text not null,
  created_at integer not null
);
`);

export type ScoreChange = {
  id: number; milestone_id: string; user_id: string; before: number; after: number; reason: string; created_at: number;
};
