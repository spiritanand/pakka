"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { spring, useAnimateIn } from "@/components/motion";
import { SubmitButton } from "@/components/submit-button";
import { NOT_BLANK } from "../format";

const MAX = 4;

const PLACEHOLDER = [
  { title: "Homepage + product pages", checklist: "Homepage live on staging URL\n3 product pages" },
  { title: "Checkout + launch", checklist: "Razorpay checkout working\nStore live on custom domain" },
  { title: "Launch support", checklist: "Fixes for the first week\nHandover call" },
  { title: "Extras", checklist: "One item per line" },
];

type Row = { title: string; amount: string; checklist: string };
const EMPTY: Row = { title: "", amount: "", checklist: "" };

export function MilestoneFields() {
  const [rows, setRows] = useState<Row[]>([EMPTY, EMPTY]);
  const animateIn = useAnimateIn();

  const onInput = (i: number) => (e: FormEvent<HTMLElement>) => {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement;
    const key = t.name === "m_title" ? "title" : t.name === "m_amount" ? "amount" : t.name === "m_checklist" ? "checklist" : null;
    if (!key) return;
    setRows((r) => r.map((row, k) => (k === i ? { ...row, [key]: t.value } : row)));
  };

  const filled = rows.filter((r) => Number(r.amount) > 0);
  const total = filled.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      {rows.map((row, i) => {
        const started = !!(row.title.trim() || row.amount.trim() || row.checklist.trim());
        const required = i === 0 || started;
        return (
          <motion.section
            key={i}
            onInput={onInput(i)}
            initial={i > 1 && animateIn ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.soft}
            className="section grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12"
          >
            <div>
              <div className="font-mono text-sm text-muted tabular-nums">0{i + 1}</div>
              <h2 className={`mt-1 font-semibold ${required ? "" : "text-ink-2"}`}>
                Milestone {i + 1}
                {i && !started ? <span className="font-normal text-muted"> (optional)</span> : null}
              </h2>
              {i ? (
                started ? <p className="mt-1 text-[13px] text-muted">Fill in all of it, or clear it to leave it out.</p> : null
              ) : (
                <p className="mt-1 text-[13px] text-muted">Each milestone is funded and paid separately.</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
                <label className="block space-y-1.5">
                  <span className="label block">Title</span>
                  <input className="input" name="m_title" placeholder={PLACEHOLDER[i].title} pattern={NOT_BLANK} title="Add a title" required={required} />
                </label>
                <label className="block space-y-1.5">
                  <span className="label block">Amount (₹)</span>
                  <input className="input tabular-nums" name="m_amount" type="number" min="1" placeholder="15000" required={required} />
                </label>
                <label className="block space-y-1.5">
                  <span className="label block">Days to deliver</span>
                  <input className="input tabular-nums" name="m_due" type="number" min="1" defaultValue={i ? 14 : 7} />
                  {i ? null : <span className="block text-xs leading-snug text-muted">Counted from the day your client pays</span>}
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="label block">Delivered means</span>
                <textarea className="input min-h-28 leading-relaxed" name="m_checklist" placeholder={PLACEHOLDER[i].checklist} required={required} />
                {i ? null : (
                  <span className="block text-xs text-muted">One item per line. Your client ticks what's missing if they send it back.</span>
                )}
              </label>
            </div>
          </motion.section>
        );
      })}

      {rows.length < MAX ? (
        <div className="section py-6! sm:py-8!">
          <button type="button" onClick={() => setRows((r) => [...r, EMPTY])} className="btn-ghost h-12 w-full border-dashed text-muted hover:text-ink">
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Add milestone
          </button>
        </div>
      ) : null}

      <section className="section flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-muted">Your client pays nothing until they fund a milestone.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p aria-live="polite" className="text-sm text-ink-2 tabular-nums">
            {total ? (
              <>
                Total <span className="font-semibold text-ink">₹{total.toLocaleString("en-IN")}</span> across {filled.length} milestone
                {filled.length === 1 ? "" : "s"}
              </>
            ) : null}
          </p>
          <SubmitButton className="btn h-11 px-5" busy="Creating…">Create Pakka link</SubmitButton>
        </div>
      </section>
    </>
  );
}
