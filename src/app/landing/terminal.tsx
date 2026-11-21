"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export type Token = { t: string; k: "key" | "string" | "number" | "literal" | "punct" | "space" };

const TONE: Record<Token["k"], string> = {
  key: "text-emerald-300",
  string: "text-amber-200/90",
  number: "text-sky-300",
  literal: "text-violet-300",
  punct: "text-white/45",
  space: "",
};

const spring = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;

export function Terminal({ command, lines, live }: { command: string; lines: Token[][]; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <div ref={ref} className="overflow-hidden rounded-xl bg-ink shadow-[0_24px_60px_-30px_rgba(6,40,28,0.55)] ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[11px] text-white/40">GET /api/trust</span>
        {live ? (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-emerald-300/80">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            live response
          </span>
        ) : null}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-white/90">
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : undefined} transition={spring}>
          <span className="text-emerald-400 select-none">$ </span>
          {command}
        </motion.div>
        <motion.div
          className="mt-2"
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={{ show: { transition: { delayChildren: 0.35, staggerChildren: 0.035 } } }}
        >
          {lines.map((line, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, x: -4 }, show: { opacity: 1, x: 0, transition: spring } }}
            >
              {line.length ? line.map((tok, j) => <span key={j} className={TONE[tok.k]}>{tok.t}</span>) : " "}
            </motion.div>
          ))}
        </motion.div>
      </pre>
    </div>
  );
}
