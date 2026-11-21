"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { spring, useAnimateIn } from "@/components/motion";

export function StatusChip({ state, tone, children }: { state: string; tone: string; children: ReactNode }) {
  const animateIn = useAnimateIn();
  return (
    <motion.span
      key={state}
      className={tone}
      initial={animateIn ? { opacity: 0, scale: 0.92 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring.settle}
    >
      {children}
    </motion.span>
  );
}

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <motion.span aria-hidden className="inline-flex text-faint" animate={{ rotate: open ? 90 : 0 }} transition={spring.snappy}>
          <ChevronRight size={16} strokeWidth={1.75} />
        </motion.span>
        {label}
      </button>
      {open ? (
        <motion.div id={id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft} className="mt-4">
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}
