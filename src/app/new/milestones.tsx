"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { spring, useAnimateIn } from "@/components/motion";
import { SubmitButton } from "@/components/submit-button";
import { NOT_BLANK } from "../format";
import { ByRole } from "./by-role";

const MAX = 4;

const PLACEHOLDER = [
  { title: "Homepage + product pages", checklist: "Homepage live on staging URL\n3 product pages" },
  { title: "Checkout + launch", checklist: "Razorpay checkout working\nStore live on custom domain" },
  { title: "Launch support", checklist: "Fixes for the first week\nHandover call" },
  { title: "Extras", checklist: "One item per line" },
];

export type Row = { title: string; amount: string; checklist: string; due?: number };
const EMPTY: Row = { title: "", amount: "", checklist: "" };

export function MilestoneFields({ initial, submitLabel = "Create Pakka link", busyLabel = "Creating…" }: { initial?: Row[]; submitLabel?: string; busyLabel?: string } = {}) {
  const [rows, setRows] = useState<Row[]>(initial?.length ? initial : [EMPTY, EMPTY]);
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
              <h2 className={`font-medium ${required ? "text-ink" : "text-ink-2"}`}>
                Milestone {i + 1}
                {i && !started ? <span className="font-normal text-muted"> (optional)</span> : null}
              </h2>
              {i ? (
                started ? <p className="mt-1 text-meta text-muted">Fill in all of it, or clear it to leave it out.</p> : null
              ) : (
                <p className="mt-1 text-meta text-muted">Each milestone is funded and paid separately.</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
                <label className="block space-y-1.5">
                  <span className="label block">Title</span>
                  <input className="input" name="m_title" defaultValue={row.title} placeholder={PLACEHOLDER[i].title} pattern={NOT_BLANK} title="Add a title" required={required} />
                </label>
                <label className="block space-y-1.5">
                  <span className="label block">Amount (₹)</span>
                  <input className="input tabular-nums" name="m_amount" type="number" min="1" defaultValue={row.amount} placeholder="15000" required={required} />
                </label>
                <label className="block space-y-1.5">
                  <span className="label block">Days to deliver</span>
                  <input className="input tabular-nums" name="m_due" type="number" min="1" defaultValue={row.due ?? (i ? 14 : 7)} />
                  {i ? null : (
                    <span className="block text-meta text-muted">
                      <ByRole work="Counted from the day your client pays" pay="Counted from the day you pay" />
                    </span>
                  )}
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="label block">Delivered means</span>
                <textarea className="input min-h-28 leading-relaxed" name="m_checklist" defaultValue={row.checklist} placeholder={PLACEHOLDER[i].checklist} required={required} />
                {i ? null : (
                  <span className="block text-meta text-muted">
                    One item per line.{" "}
                    <ByRole work="Your client ticks what's missing if they send it back." pay="You tick what's missing if you send it back." />
                  </span>
                )}
              </label>
            </div>
          </motion.section>
        );
      })}

      {rows.length < MAX ? (
        <div className="section py-6! sm:py-8!">
          <button type="button" onClick={() => setRows((r) => [...r, EMPTY])} className="btn-ghost w-full border-dashed text-muted hover:text-ink">
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Add milestone
          </button>
        </div>
      ) : null}

      <section className="section flex flex-wrap items-center justify-between gap-4">
        <p className="text-meta text-muted">
          <ByRole work="Your client pays nothing until they fund a milestone." pay="You pay nothing until a freelancer accepts and you fund a milestone." />
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p aria-live="polite" className="text-sm text-ink-2 tabular-nums">
            {total ? (
              <>
                Total <span className="font-medium text-ink">₹{total.toLocaleString("en-IN")}</span> across {filled.length} milestone
                {filled.length === 1 ? "" : "s"}
              </>
            ) : null}
          </p>
          <SubmitButton className="btn" busy={busyLabel}>{submitLabel}</SubmitButton>
        </div>
      </section>
    </>
  );
}
