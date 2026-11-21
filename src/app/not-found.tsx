import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { Ghost } from "./ghost";

export default async function NotFound() {
  const u = await currentUser();
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] flex-col items-center justify-center py-16 text-center">
      <Ghost />
      <p className="mt-6 font-mono text-xs tracking-wide text-muted">404 · ghosted</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl">
        This page ghosted you.
      </h1>
      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-pretty text-muted">
        It missed its deadline with nothing delivered. Luckily the money was held, so you&apos;re getting it all back.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-line bg-wash px-3 py-1.5 text-[13px] text-ink-2">
        <span className="font-mono tabular-nums text-rose-700">0</span>
        <span className="text-muted">/1000</span>
        <span className="text-faint">·</span>
        <span>This page&apos;s trust score</span>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {u ? (
          <>
            <Link href="/dashboard" className="btn h-11 px-5">Back to your deals</Link>
            <Link href="/" className="btn-ghost h-11 px-5">Home</Link>
          </>
        ) : (
          <>
            <Link href="/" className="btn h-11 px-5">Take me home</Link>
            <Link href="/login" className="btn-ghost h-11 px-5">Try the demo</Link>
          </>
        )}
      </div>
    </div>
  );
}
