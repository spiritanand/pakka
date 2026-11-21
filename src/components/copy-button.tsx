"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { spring } from "@/components/motion";

type Variant = "ghost" | "dark" | "icon";
type Size = "sm" | "md";

const CLASS: Record<Variant, Record<Size, string>> = {
  ghost: { sm: "btn-ghost btn-sm", md: "btn-ghost" },
  dark: {
    sm: "inline-flex h-8 items-center justify-center rounded-md px-3 text-meta font-medium whitespace-nowrap text-white/80 ring-1 ring-white/10 bg-white/[0.06] transition-colors hover:bg-white/10",
    md: "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium whitespace-nowrap text-white/80 ring-1 ring-white/10 bg-white/[0.06] transition-colors hover:bg-white/10",
  },
  icon: {
    sm: "inline-grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-wash hover:text-ink",
    md: "inline-grid size-10 place-items-center rounded-md text-muted transition-colors hover:bg-wash hover:text-ink",
  },
};

const COPIED = "Copied";

export function CopyButton({
  value,
  label = "Copy",
  href = false,
  variant = "ghost",
  size = "sm",
  className = "",
}: {
  value: string;
  label?: string;
  href?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduce = useReducedMotion();
  const iconOnly = variant === "icon";

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const text = href && value.startsWith("/") ? window.location.origin + value : value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)", scale: 0.85 };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1 };
  const face = (on: boolean) => (
    <>
      {on ? <Check size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-emerald-600" /> : <Copy size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />}
      {iconOnly ? null : <span>{on ? COPIED : label}</span>}
    </>
  );

  return (
    <>
      <motion.button
        type="button"
        onClick={copy}
        whileTap={{ scale: 0.97 }}
        transition={spring.snappy}
        aria-label={iconOnly ? (copied ? COPIED : label) : undefined}
        className={`shrink-0 ${CLASS[variant][size]} ${className}`}
      >
        <span className="relative inline-grid items-center justify-items-center">
          {iconOnly ? null : (
            <>
              <span aria-hidden className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5">{face(false)}</span>
              <span aria-hidden className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5">{face(true)}</span>
            </>
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              className="col-start-1 row-start-1 inline-flex items-center gap-1.5"
              initial={hidden}
              animate={shown}
              exit={hidden}
              transition={spring.snappy}
            >
              {face(copied)}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
      <span role="status" className="sr-only">{copied ? COPIED : ""}</span>
    </>
  );
}
