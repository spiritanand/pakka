import { NextResponse } from "next/server";
import { confirmFunding } from "@/lib/deals";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = url.searchParams.get("m");
  if (!m) return NextResponse.json({ error: "missing milestone" }, { status: 400 });
  const slug = await confirmFunding(m);
  return NextResponse.redirect(new URL(`/d/${slug}`, process.env.APP_URL ?? url.origin));
}
