"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { spring } from "@/components/motion";
import { SubmitButton } from "@/components/submit-button";
import { reject } from "../../actions";

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
        <motion.span aria-hidden className="inline-flex text-muted" animate={{ rotate: open ? 90 : 0 }} transition={spring.snappy}>
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

export function SendBackForm({ milestoneId, slug, checklist, freelancer }: {
  milestoneId: string; slug: string; checklist: string[]; freelancer: string;
}) {
  const [missing, setMissing] = useState<Set<number>>(new Set());
  const toggle = (i: number, on: boolean) =>
    setMissing((prev) => {
      const next = new Set(prev);
      if (on) next.add(i);
      else next.delete(i);
      return next;
    });
  return (
    <form action={reject} className="space-y-4 text-sm">
      <input type="hidden" name="m" value={milestoneId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="border-t border-line">
        {checklist.map((c, i) => (
          <label key={i} className="flex cursor-pointer items-start gap-3 border-b border-line py-2.5 transition-colors hover:bg-wash">
            <input
              type="checkbox"
              name={`fail_${i}`}
              onChange={(e) => toggle(i, e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-rose-700"
            />{" "}
            {c}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SubmitButton className="btn-ghost" busy="Sending back…" disabled={missing.size === 0}>Send back for fixes</SubmitButton>
        <p className="text-meta text-muted">
          {missing.size === 0
            ? "Tick what's missing."
            : `${freelancer} gets 48 hours to fix it. Sending it back twice marks it disputed.`}
        </p>
      </div>
    </form>
  );
}
