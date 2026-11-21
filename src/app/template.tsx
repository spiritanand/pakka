"use client";

import { motion, MotionGlobalConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { spring, useAnimateIn } from "@/components/motion";

const QUIET_ON_REVISIT = new Set(["/", "/paying"]);
const visited = new Set<string>();

export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const animateIn = useAnimateIn();
  const [revisit] = useState(() => QUIET_ON_REVISIT.has(path) && visited.has(path));
  // Set during render so it is in place before child animations start; children's effects run before ours.
  MotionGlobalConfig.skipAnimations = revisit;
  useEffect(() => {
    visited.add(path);
  }, [path]);
  return (
    <motion.div initial={animateIn && !revisit ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
      {children}
    </motion.div>
  );
}
