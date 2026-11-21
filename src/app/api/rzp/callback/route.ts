import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmFunding } from "@/lib/deals";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.APP_URL ?? url.origin;
  const m = url.searchParams.get("m");
  if (!m) return NextResponse.json({ error: "missing milestone" }, { status: 400 });
  try {
    const slug = await confirmFunding(m);
    return NextResponse.redirect(new URL(`/d/${slug}`, base));
  } catch (e) {
    console.error("confirmFunding", m, e);
    const row = db.prepare(`select d.slug from milestones m join deals d on d.id = m.deal_id where m.id = ?`).get(m) as { slug: string } | undefined;
    return NextResponse.redirect(new URL(row ? `/d/${row.slug}?funding=pending` : "/dashboard", base));
  }
}
