"use client";

import { motion } from "motion/react";
import { Check as CheckIcon } from "lucide-react";
import { spring } from "@/components/motion";

const CHECKLIST = [
  { text: "3 logo directions, PNG + SVG", done: true },
  { text: "Colour palette with hex codes", done: true },
  { text: "Editable Figma source shared", done: false },
];

const TICK_AT = 0.6;

function Check({ done, delay }: { done: boolean; delay: number }) {
  if (!done) return <span className="size-4 shrink-0 rounded-sm border border-line-strong bg-paper" />;
  return (
    <span className="relative grid size-4 shrink-0 place-items-center">
      <span className="absolute inset-0 rounded-sm border border-line-strong bg-paper" />
      <motion.span
        className="relative grid size-4 place-items-center rounded-sm bg-emerald-700 text-white"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring.snappy, delay }}
      >
        <CheckIcon size={11} strokeWidth={2.5} aria-hidden />
      </motion.span>
    </span>
  );
}

export function DealMock() {
  return (
    <motion.div
      aria-label="Example deal: ₹15,000 held by Razorpay"
      role="img"
      initial={{ opacity: 0.6, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.soft}
      className="w-full max-w-[420px] rounded-lg border border-line bg-paper text-left"
    >
      <div className="border-b border-line px-5 py-3 text-meta font-medium text-ink">Logo for Kettle &amp; Co. café</div>

      <div className="px-5 pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-meta text-muted">Milestone 1 of 2</div>
            <div className="mt-0.5 font-medium text-ink">Brand identity drafts</div>
          </div>
          <motion.span
            className="chip-emerald"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring.settle, delay: 0.4 }}
          >
            <span className="dot" />
            Held by Razorpay
          </motion.span>
        </div>
        <div className="mt-4 text-[32px] leading-none font-medium tracking-[-0.02em] tabular-nums text-ink">₹15,000</div>

        <div className="mt-5 text-meta text-muted">Delivered means</div>
        <ul className="mt-2 space-y-2">
          {CHECKLIST.map((c, i) => (
            <li key={c.text} className="flex items-center gap-2.5 text-meta text-ink-2">
              <Check done={c.done} delay={TICK_AT + i * 0.16} />
              <span className={c.done ? "" : "text-muted"}>{c.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-2 rounded-md bg-wash px-3 py-2 text-meta text-ink-2">
          <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
          Due 28 Nov. If Meera says nothing for 72h after delivery, Rohan is paid.
        </div>
      </div>
    </motion.div>
  );
}
