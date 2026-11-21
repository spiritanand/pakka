"use client";

import { motion } from "motion/react";
import { spring, useAnimateIn } from "@/components/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const animateIn = useAnimateIn();
  return (
    <motion.div initial={animateIn ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
      {children}
    </motion.div>
  );
}
