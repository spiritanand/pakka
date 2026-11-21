"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

const spring = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <a key={m.index} href={m[2]} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-emerald-400">
          {m[1]}
        </a>,
        <span key={`${m.index}u`} className="text-white/40"> {m[2]}</span>,
      );
    } else if (m[3]) out.push(<b key={m.index} className="font-medium text-white">{m[3]}</b>);
    else if (m[4]) out.push(<code key={m.index} className="text-emerald-300">{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const body: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) body.push(lines[i]);
      blocks.push(
        <pre key={i} className="my-4 overflow-x-auto rounded-lg bg-white/[0.04] p-4 text-[12.5px] leading-relaxed text-emerald-200/90 ring-1 ring-white/10">
          {body.join("\n")}
        </pre>,
      );
    } else if (line.startsWith("# ")) blocks.push(<h1 key={i} className="mb-6 text-lg font-semibold text-white">{line.slice(2)}</h1>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={i} className="mt-10 mb-3 font-semibold text-white">{line.slice(3)}</h2>);
    else if (line.startsWith("> ")) blocks.push(<p key={i} className="my-3 border-l border-emerald-400/50 pl-4 text-white/80">{inline(line.slice(2))}</p>);
    else if (/^(- |\d+\. )/.test(line)) blocks.push(<p key={i} className="my-1.5 pl-5 -indent-5">{inline(line)}</p>);
    else if (line.startsWith("|")) {
      if (!/^\|[-| ]+\|$/.test(line)) blocks.push(<p key={i} className="whitespace-pre text-white/70">{line}</p>);
    } else if (line.trim()) blocks.push(<p key={i} className="my-3">{inline(line)}</p>);
  }
  return <>{blocks}</>;
}

export function ViewToggle({ markdown }: { markdown: string }) {
  const [machine, setMachine] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMachine(new URLSearchParams(window.location.search).get("view") === "machine");
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (machine) url.searchParams.set("view", "machine");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
    document.documentElement.style.overflow = machine ? "hidden" : "";
  }, [machine]);

  return (
    <>
      <AnimatePresence>
        {machine ? (
          <motion.div
            key="machine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="fixed inset-0 z-40 overflow-y-auto bg-[#0b0f0d] font-mono text-[13.5px] leading-[1.75] text-white/65"
            role="region"
            aria-label="Machine-readable version of this page"
          >
            <motion.article
              initial={{ y: 8 }}
              animate={{ y: 0 }}
              transition={spring}
              className="mx-auto max-w-3xl px-6 pt-20 pb-32"
            >
              <div className="mb-10 flex flex-wrap items-center gap-3 text-[12px]">
                <a href="/index.md" className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10">/index.md</a>
                <a href="/llms.txt" className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10">/llms.txt</a>
                <button
                  className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                  onClick={async () => {
                    await navigator.clipboard.writeText(markdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? "Copied" : "Copy markdown"}
                </button>
                <span className="text-white/35">or send <code className="text-emerald-300">Accept: text/markdown</code> to /</span>
              </div>
              <Markdown source={markdown} />
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        role="radiogroup"
        aria-label="Page view"
        className={`fixed right-4 bottom-4 z-50 flex rounded-lg p-1 font-mono text-[12px] shadow-lg ring-1 transition-colors ${
          machine ? "bg-[#151b18] ring-white/10" : "bg-paper ring-line"
        }`}
      >
        {(["Human", "Machine"] as const).map((label) => {
          const active = (label === "Machine") === machine;
          return (
            <button
              key={label}
              role="radio"
              aria-checked={active}
              onClick={() => setMachine(label === "Machine")}
              className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 ${
                active ? (machine ? "text-ink" : "text-white") : machine ? "text-white/60 hover:text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="view-pill"
                  transition={spring}
                  className={`absolute inset-0 rounded-md ${machine ? "bg-white" : "bg-ink"}`}
                />
              ) : null}
              <span className={`relative size-2.5 rounded-[2px] ring-1 ${active ? "bg-current ring-current" : "ring-current/60"}`} />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
