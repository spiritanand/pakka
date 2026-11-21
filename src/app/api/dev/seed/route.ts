import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { seedDemo } from "@/lib/seed";

async function allowed(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (secret && req.headers.get("x-seed-secret") === secret) return true;
  if (!secret && process.env.NODE_ENV !== "production" && req.headers.get("x-seed") === "1") return true;
  return !!(await currentUser())?.email.endsWith("@pakka.demo");
}

export async function POST(req: Request) {
  if (!(await allowed(req))) return NextResponse.json({ error: "not found" }, { status: 404 });
  const res = NextResponse.json({ ok: true, ...(await seedDemo()) });
  for (const c of req.headers.get("cookie")?.split(";") ?? []) {
    const name = c.split("=")[0].trim();
    if (name.includes("better-auth")) res.cookies.set(name, "", { expires: new Date(0), path: "/", secure: name.startsWith("__Secure-") });
  }
  return res;
}
