import { toNextJsHandler } from "better-auth/next-js";
import { auth, ensureMigrated } from "@/lib/auth";

const h = toNextJsHandler(auth);

export async function GET(req: Request) {
  await ensureMigrated();
  return h.GET(req);
}

export async function POST(req: Request) {
  await ensureMigrated();
  return h.POST(req);
}
