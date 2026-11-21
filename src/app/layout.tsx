import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { currentUser } from "@/lib/auth";
import { signOut } from "./actions";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pakka — pay links that hold until the work lands",
  description: "Milestone payments held on Razorpay, and a 0–1000 trust score both sides carry.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const u = await currentUser();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            pakka<span className="text-emerald-600">.</span>
          </Link>
          {u ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/u/${u.id}`} className="hover:underline">{u.name}</Link>
              <form action={signOut}><button className="btn-ghost">Sign out</button></form>
            </div>
          ) : null}
        </header>
        <main className="mx-auto max-w-5xl px-5 pb-20">{children}</main>
      </body>
    </html>
  );
}
