import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { currentUser } from "@/lib/auth";
import { MotionProvider } from "@/components/motion";
import { signOut } from "./actions";
import { MarkdownLink } from "./markdown-link";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Pakka · Money held by Razorpay until the work is done",
  description: "Your client pays up front, Razorpay holds it, and you're paid when you deliver. Every finished deal builds a 0–1000 trust score.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const u = await currentUser();
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
        <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
          <div className="rails flex h-16 items-center justify-between gap-4">
            <Link href="/" aria-label="Pakka home" className="flex items-center text-ink">
              <img src="/icon" alt="" width={32} height={32} className="size-8 rounded-[8px] sm:hidden" />
              <span className="hidden text-[24px] font-semibold tracking-[-0.035em] sm:inline">
                pakka<span className="text-emerald-600">.</span>
              </span>
            </Link>
            {u ? (
              <nav className="flex items-center gap-1 text-sm sm:gap-2">
                <Link href="/dashboard" prefetch={true} className="rounded-md px-2.5 py-1.5 text-ink-2 transition-colors hover:bg-wash hover:text-ink">
                  Dashboard
                </Link>
                <Link
                  href={`/u/${u.id}`}
                  className="hidden max-w-[12rem] truncate rounded-md px-2.5 py-1.5 text-ink-2 transition-colors hover:bg-wash hover:text-ink sm:block"
                >
                  {u.name.split(" (")[0]}
                </Link>
                <form action={signOut}>
                  <button className="btn-ghost btn-sm">Sign out</button>
                </form>
              </nav>
            ) : (
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/login?mode=signin" className="rounded-md px-2.5 py-1.5 text-ink-2 transition-colors hover:bg-wash hover:text-ink">
                  Sign in
                </Link>
                <Link href="/login?next=/new" className="btn btn-sm">Create a Pakka link</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="rails flex-1 pt-10 pb-24 sm:pt-14">{children}</main>
        <footer className="border-t border-line">
          <div className="rails flex flex-wrap items-center justify-between gap-3 py-6 text-[13px] text-muted">
            <span>
              <span className="font-semibold text-ink">pakka<span className="text-emerald-600">.</span></span>
              <span className="ml-2">Money held by Razorpay until the work is done.</span>
            </span>
            <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <MarkdownLink />
            </span>
          </div>
        </footer>
        </MotionProvider>
      </body>
    </html>
  );
}
