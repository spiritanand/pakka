"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { spring } from "@/components/motion";

const MotionLink = motion.create(Link);

export function BackLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <MotionLink
      href={href}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={`inline-flex items-center gap-1.5 text-meta text-muted transition-colors hover:text-ink ${className}`}
    >
      <motion.span variants={{ rest: { x: 0 }, hover: { x: -3 } }} transition={spring.snappy} className="inline-flex">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
      </motion.span>
      {label}
    </MotionLink>
  );
}
