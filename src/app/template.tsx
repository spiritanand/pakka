"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { spring } from "@/components/motion";

// First paint stays fully visible (no opacity:0 in SSR HTML); only client navigations animate in.
let hydrated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const animateIn = hydrated;
  useEffect(() => {
    hydrated = true;
  }, []);
  return (
    <motion.div initial={animateIn ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
      {children}
    </motion.div>
  );
}
