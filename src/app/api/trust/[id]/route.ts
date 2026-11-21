import { NextResponse } from "next/server";
import { ensureMigrated } from "@/lib/auth";
import { trustReport } from "@/lib/trust-report";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await ensureMigrated();
  const { id } = await ctx.params;
  const report = trustReport(decodeURIComponent(id));
  if (!report) return NextResponse.json({ error: "unknown subject", status: "unknown" }, { status: 404 });
  return NextResponse.json(report);
}
