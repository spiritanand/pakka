import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { currentUser } from "@/lib/auth";
import { MotionProvider } from "@/components/motion";
import { signOut } from "./actions";
import { MarkdownLink } from "./markdown-link";
import { firstName } from "./format";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

const NAV = "py-1.5 text-ink-2 transition-colors hover:text-ink";

const DESCRIPTION = "Your client pays up front, Razorpay holds it, and you're paid when you deliver. Every finished deal builds a 0–1000 trust score.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://pakka.zwala.dev"),
  title: { default: "Pakka · Money held by Razorpay until the work is done", template: "%s · Pakka" },
  description: DESCRIPTION,
  openGraph: {
    siteName: "Pakka",
    type: "website",
    title: "Pakka · Money held by Razorpay until the work is done",
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const u = await currentUser();
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
        <header className="sticky top-0 z-30 border-b border-line bg-paper">
          <div className="rails flex h-14 items-center justify-between gap-4">
            <Link href="/" aria-label="Pakka home" className="flex items-center text-ink">
              <img src="/icon" alt="" width={28} height={28} className="size-7 rounded-md sm:hidden" />
              <span className="hidden text-[22px] font-semibold tracking-[-0.03em] sm:inline">
                pakka<span className="text-emerald-600">.</span>
              </span>
            </Link>
            {u ? (
              <nav className="flex items-center gap-4 text-sm sm:gap-6">
                <Link href="/dashboard" prefetch={true} className={NAV}>
                  Dashboard
                </Link>
                <Link href={`/u/${u.id}`} className={`hidden max-w-[12rem] truncate sm:block ${NAV}`}>
                  {firstName(u.name)}
                </Link>
                <form action={signOut} className="flex">
                  <button className={NAV}>Sign out</button>
                </form>
              </nav>
            ) : (
              <nav className="flex items-center gap-4 text-sm sm:gap-6">
                <Link href="/login?mode=signin" className={NAV}>
                  Sign in
                </Link>
                <Link href="/login?next=/new" className="btn btn-sm">Create a Pakka link</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="rails flex-1 pt-12 pb-24 sm:pt-16">{children}</main>
        <footer className="border-t border-line">
          <div className="rails flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-meta text-muted">
            <span>
              <span className="font-semibold text-ink">pakka<span className="text-emerald-600">.</span></span>
              <span className="ml-2">Money held by Razorpay until the work is done.</span>
            </span>
            <MarkdownLink />
          </div>
        </footer>
        </MotionProvider>
      </body>
    </html>
  );
}
