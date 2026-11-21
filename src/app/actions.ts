"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth, currentUser, ensureMigrated } from "@/lib/auth";
import * as deals from "@/lib/deals";
import { safeNext } from "./format";

async function me() {
  const u = await currentUser();
  if (!u) redirect("/login?mode=signin");
  return u;
}

async function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

function backToLogin(form: FormData, mode: "signup" | "signin", error: string): never {
  const next = safeNext(form.get("next"));
  redirect(`/login?mode=${mode}&error=${error}&next=${encodeURIComponent(next)}`);
}

export async function signUp(form: FormData) {
  await ensureMigrated();
  const pan = String(form.get("pan") ?? "").trim().toUpperCase();
  const phone = String(form.get("phone") ?? "").trim();
  if (pan && db.prepare(`select 1 from user where upper(pan) = ?`).get(pan)) backToLogin(form, "signup", "pan");
  if (phone && db.prepare(`select 1 from user where phone = ?`).get(phone)) backToLogin(form, "signup", "phone");
  let error = "";
  try {
    await auth.api.signUpEmail({
      body: {
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        phone,
        pan,
        gstin: String(form.get("gstin") ?? "").trim().toUpperCase(),
      },
    });
  } catch (e) {
    error = /exist/i.test(String((e as Error)?.message)) ? "email" : "signup";
  }
  if (error) backToLogin(form, "signup", error);
  redirect(safeNext(form.get("next")));
}

export async function signIn(form: FormData) {
  await ensureMigrated();
  let ok = true;
  try {
    await auth.api.signInEmail({ body: { email: String(form.get("email")), password: String(form.get("password")) } });
  } catch {
    ok = false;
  }
  if (!ok) backToLogin(form, "signin", "signin");
  redirect(safeNext(form.get("next")));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function createDeal(form: FormData) {
  const u = await me();
  const title = String(form.get("title") ?? "").trim();
  if (!title) redirect("/new?error=title");
  const titles = form.getAll("m_title").map(String);
  const amounts = form.getAll("m_amount").map(String);
  const checklists = form.getAll("m_checklist").map(String);
  const dues = form.getAll("m_due").map(Number);
  const rows = titles.map((t, i) => ({
    title: t.trim(),
    amount: Number(amounts[i] ?? ""),
    rawAmount: String(amounts[i] ?? "").trim(),
    checklist: String(checklists[i] ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    dueDays: dues[i] > 0 ? dues[i] : 7,
  }));
  const complete = (m: (typeof rows)[number]) => !!m.title && m.amount > 0 && m.checklist.length > 0;
  const partial = rows.findIndex((m) => !complete(m) && (m.title || m.rawAmount || m.checklist.length));
  if (partial >= 0) redirect(`/new?error=partial&m=${partial + 1}`);
  const milestones = rows.filter(complete).map(({ title, amount, checklist, dueDays }) => ({ title, amount, checklist, dueDays }));
  if (!milestones.length) redirect("/new?error=empty");
  const slug = deals.createDeal({ freelancerId: u.id, title, milestones });
  redirect(`/d/${slug}`);
}

export async function fund(form: FormData) {
  const u = await me();
  const url = await deals.startFunding(String(form.get("m")), u.id, await appUrl());
  redirect(url);
}

export async function submit(form: FormData) {
  const u = await me();
  const m = deals.getMilestone(String(form.get("m")))!;
  const n = (JSON.parse(m.checklist) as string[]).length;
  const ticks = Array.from({ length: n }, (_, i) => i).filter((i) => form.get(`tick_${i}`));
  const raw = String(form.get("url") ?? "").trim();
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
  deals.submitWork(m.id, u.id, url, ticks);
  revalidatePath(`/d/${form.get("slug")}`);
}

export async function accept(form: FormData) {
  const u = await me();
  await deals.accept(String(form.get("m")), u.id);
  revalidatePath(`/d/${form.get("slug")}`);
}

export async function reject(form: FormData) {
  const u = await me();
  const m = deals.getMilestone(String(form.get("m")))!;
  const n = (JSON.parse(m.checklist) as string[]).length;
  const failed = Array.from({ length: n }, (_, i) => i).filter((i) => form.get(`fail_${i}`));
  if (!failed.length) redirect(`/d/${form.get("slug")}`);
  deals.reject(m.id, u.id, failed);
  revalidatePath(`/d/${form.get("slug")}`);
}

export async function fastForward(form: FormData) {
  const u = await me();
  await deals.fastForward(String(form.get("m")), u.id);
  revalidatePath(`/d/${form.get("slug")}`);
}

export async function vouch(form: FormData) {
  const u = await me();
  const vouchee = String(form.get("vouchee"));
  if (vouchee === u.id) throw new Error("You can't vouch for yourself");
  db.prepare(`insert or ignore into vouches (voucher_id, vouchee_id, note, created_at) values (?, ?, ?, ?)`).run(
    u.id, vouchee, String(form.get("note") ?? ""), Date.now(),
  );
  revalidatePath(`/u/${vouchee}`);
}
