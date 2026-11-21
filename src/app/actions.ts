"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth, currentUser, ensureMigrated } from "@/lib/auth";
import * as deals from "@/lib/deals";

async function me() {
  const u = await currentUser();
  if (!u) redirect("/");
  return u;
}

async function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function signUp(form: FormData) {
  await ensureMigrated();
  await auth.api.signUpEmail({
    body: {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      phone: String(form.get("phone") ?? ""),
      pan: String(form.get("pan") ?? "").toUpperCase(),
      gstin: String(form.get("gstin") ?? "").toUpperCase(),
    },
  });
  redirect(String(form.get("next") || "/"));
}

export async function signIn(form: FormData) {
  await ensureMigrated();
  await auth.api.signInEmail({ body: { email: String(form.get("email")), password: String(form.get("password")) } });
  redirect(String(form.get("next") || "/"));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function createDeal(form: FormData) {
  const u = await me();
  const titles = form.getAll("m_title").map(String);
  const amounts = form.getAll("m_amount").map(Number);
  const checklists = form.getAll("m_checklist").map(String);
  const dues = form.getAll("m_due").map(Number);
  const milestones = titles
    .map((title, i) => ({
      title: title.trim(),
      amount: amounts[i],
      checklist: checklists[i].split("\n").map((s) => s.trim()).filter(Boolean),
      dueDays: dues[i] || 7,
    }))
    .filter((m) => m.title && m.amount > 0 && m.checklist.length);
  if (!milestones.length) throw new Error("Add at least one milestone with an amount and a checklist");
  const slug = deals.createDeal({ freelancerId: u.id, title: String(form.get("title")), milestones });
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
  deals.submitWork(m.id, u.id, String(form.get("url")), ticks);
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
  deals.reject(m.id, u.id, failed);
  revalidatePath(`/d/${form.get("slug")}`);
}

export async function fastForward(form: FormData) {
  await me();
  await deals.fastForward(String(form.get("m")));
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
