import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { Ghost } from "./ghost";

export default async function NotFound() {
  const u = await currentUser();
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] flex-col items-center justify-center py-16 text-center">
      <Ghost />
      <h1 className="mt-8 text-title">This page ghosted you.</h1>
      <p className="mt-3 max-w-md text-ink-2">
        It missed its deadline with nothing delivered. Luckily the money was held, so you&apos;re getting it all back.
      </p>
      <p className="mt-4 text-meta text-muted tabular-nums">
        404 · trust score <span className="font-medium text-rose-700">0</span>/1000
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {u ? (
          <>
            <Link href="/dashboard" className="btn">Back to your deals</Link>
            <Link href="/" className="btn-ghost">Home</Link>
          </>
        ) : (
          <>
            <Link href="/" className="btn">Take me home</Link>
            <Link href="/login" className="btn-ghost">Try the demo</Link>
          </>
        )}
      </div>
    </div>
  );
}
