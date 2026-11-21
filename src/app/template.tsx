"use client";

import { motion, MotionGlobalConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Entrances, spring, useAnimateIn } from "@/components/motion";

const MARKETING = new Set(["/", "/paying"]);
const visited = new Set<string>();

export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const animateIn = useAnimateIn();
  const marketing = MARKETING.has(path);
  const [revisit] = useState(() => marketing && visited.has(path));
  // Set during render so it is in place before child animations start; children's effects run before ours.
  MotionGlobalConfig.skipAnimations = revisit;
  useEffect(() => {
    visited.add(path);
  }, [path]);
  if (!marketing) return <Entrances on={false}>{children}</Entrances>;
  return (
    <Entrances on={!revisit}>
      <motion.div initial={animateIn && !revisit ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
        {children}
      </motion.div>
    </Entrances>
  );
}
