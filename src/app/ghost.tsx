"use client";

import { motion, useReducedMotion } from "motion/react";

export function Ghost() {
  const still = useReducedMotion();
  return (
    <div className="relative mx-auto h-56 w-56" aria-hidden>
      <motion.div
        className="absolute inset-x-10 bottom-2 h-3 rounded-[50%] bg-ink/10 blur-[2px]"
        animate={still ? undefined : { scaleX: [1, 0.78, 1], opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 120 140"
        className="absolute inset-x-0 top-0 mx-auto h-48 w-44 drop-shadow-[0_18px_30px_rgba(6,40,28,0.12)]"
        initial={{ opacity: 0, y: 24, rotate: -4 }}
        animate={still ? { opacity: 1, y: 0, rotate: 0 } : { opacity: [0, 1, 1], y: [24, -6, 4], rotate: [-4, 3, -2] }}
        transition={
          still
            ? { duration: 0 }
            : { duration: 3.2, times: [0, 0.4, 1], repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      >
        <path
          d="M60 6C32 6 14 26 14 56v66c0 5 6 7 9 3l8-9 9 10c2 2 5 2 7 0l9-10 8 10c2 2 5 2 7 0l9-10 9 10c2 2 5 2 7 0l8-9c3 4 9 2 9-3V56C106 26 88 6 60 6Z"
          fill="#ffffff"
          stroke="#0b1712"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <motion.g
          animate={still ? undefined : { x: [0, 5, 5, -5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="45" cy="58" rx="6" ry="8" fill="#0b1712" />
          <ellipse cx="75" cy="58" rx="6" ry="8" fill="#0b1712" />
          <circle cx="47" cy="55" r="2" fill="#ffffff" />
          <circle cx="77" cy="55" r="2" fill="#ffffff" />
        </motion.g>
        <path d="M52 82c5 4 11 4 16 0" stroke="#0b1712" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="98" cy="96" r="6" fill="#059669" />
      </motion.svg>
      <motion.div
        className="absolute top-6 -right-4 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-800 shadow-sm"
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", visualDuration: 0.4, bounce: 0.2, delay: 0.5 }}
      >
        ₹0 lost
      </motion.div>
    </div>
  );
}
