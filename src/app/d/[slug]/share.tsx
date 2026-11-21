import { headers } from "next/headers";
import type { ReactNode } from "react";

export async function siteOrigin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "pakka.zwala.dev").split(",")[0].trim();
  const proto = (h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https")).split(",")[0].trim();
  return `${proto}://${host}`;
}

export function whatsappHref(url: string, title: string, fromClient = false) {
  const text = fromClient
    ? `Here's the Pakka link for ${title}. Accept it and I pay up front. Razorpay holds the money until you deliver.\n${url}`
    : `Here's the Pakka link for ${title}. You pay up front and Razorpay holds the money until the work is delivered.\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function Tip({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 rounded-sm bg-ink px-2 py-1 text-xs leading-none font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
