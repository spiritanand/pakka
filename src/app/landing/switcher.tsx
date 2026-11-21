import Link from "next/link";
import type { Audience } from "./landing";

const SIDES: { audience: Audience; href: string; short: string; long: string }[] = [
  { audience: "freelancing", href: "/", short: "Freelancing", long: "I'm freelancing" },
  { audience: "paying", href: "/paying", short: "Paying", long: "I'm paying a freelancer" },
];

export function Switcher({ audience }: { audience: Audience }) {
  return (
    <nav aria-label="Who are you?" className="grid w-full grid-cols-2 rounded-full border border-line bg-paper p-1 sm:inline-grid sm:w-auto">
      {SIDES.map((s) => {
        const active = s.audience === audience;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={`flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "bg-brand text-white" : "text-ink-2 hover:bg-wash hover:text-ink"
            }`}
          >
            <span className="sm:hidden">{s.short}</span>
            <span className="hidden sm:inline">{s.long}</span>
          </Link>
        );
      })}
    </nav>
  );
}
