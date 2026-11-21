"use client";

import { motion } from "motion/react";
import { SpringNumber, spring } from "@/components/motion";

const ROWS = [
  { name: "Rohan", why: "Missed the deadline", from: 323, to: 23 },
  { name: "Priya", why: "Vouched for Rohan", from: 695, to: 545 },
];

const viewport = { once: true, amount: 0.6 };

export function Cascade() {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {ROWS.map((c, i) => {
        const delay = 0.2 + i * 0.14;
        return (
          <li key={c.name} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-ink">{c.name}</span>
                <span className="ml-2 text-sm text-muted">{c.why}</span>
              </div>
              <div className="shrink-0 text-sm tabular-nums">
                <span className="text-muted line-through decoration-muted/60">{c.from}</span>
                <span className="mx-1.5 text-muted">to</span>
                <SpringNumber
                  from={c.from}
                  to={c.to}
                  duration={0.9}
                  delay={delay}
                  className="inline-block min-w-[3ch] text-right font-medium text-ink"
                />
                <motion.span
                  className="ml-2 inline-block text-rose-700"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={viewport}
                  transition={{ ...spring.soft, delay: delay + 0.5 }}
                >
                  −{c.from - c.to}
                </motion.span>
              </div>
            </div>
            <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="absolute inset-y-0 left-0 bg-rose-200" style={{ width: `${c.from / 10}%` }} />
              <motion.div
                className="absolute inset-y-0 left-0 origin-left bg-ink"
                style={{ width: `${c.from / 10}%` }}
                initial={{ scaleX: 1 }}
                whileInView={{ scaleX: c.to / c.from }}
                viewport={viewport}
                transition={{ type: "spring", visualDuration: 0.9, bounce: 0, delay }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
