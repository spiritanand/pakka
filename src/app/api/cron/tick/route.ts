import { NextResponse } from "next/server";
import { tickDue } from "@/lib/deals";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(await tickDue());
}
