import Link from "next/link";
import type { Audience } from "./landing";

const SIDES: { audience: Audience; href: string; label: string }[] = [
  { audience: "freelancing", href: "/", label: "I'm freelancing" },
  { audience: "paying", href: "/paying", label: "I'm paying a freelancer" },
];

export function Switcher({ audience }: { audience: Audience }) {
  return (
    <nav aria-label="Who are you?" className="inline-flex rounded-full border border-line bg-wash p-0.5 text-meta">
      {SIDES.map((s) => {
        const active = s.audience === audience;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={`flex h-8 items-center rounded-full px-3.5 font-medium whitespace-nowrap transition-colors ${
              active ? "bg-paper text-ink ring-1 ring-line" : "text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
