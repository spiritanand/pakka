"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "motion/react";

export const spring = {
  soft: { type: "spring", visualDuration: 0.5, bounce: 0 },
  snappy: { type: "spring", visualDuration: 0.22, bounce: 0 },
  settle: { type: "spring", visualDuration: 0.6, bounce: 0.12 },
} as const satisfies Record<string, Transition>;

type Tag = "div" | "section" | "ul" | "ol" | "li" | "span" | "header" | "p";
const tagOf = (as: Tag) => motion[as] as typeof motion.div;
type BaseProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView" | "variants" | "transition"> & {
  as?: Tag;
  delay?: number;
  y?: number;
};

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring.soft}>
      {children}
    </MotionConfig>
  );
}

export function Enter({ as = "div", delay = 0, y = 8, ...rest }: BaseProps) {
  const M = tagOf(as);
  return <M initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay }} {...rest} />;
}

export function Reveal({ as = "div", delay = 0, y = 8, amount = 0.1, ...rest }: BaseProps & { amount?: number }) {
  const M = tagOf(as);
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ ...spring.soft, delay }}
      {...rest}
    />
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: spring.soft },
};

export function Stagger({
  as = "div",
  delay = 0,
  gap = 0.06,
  inView = false,
  ...rest
}: Omit<BaseProps, "y"> & { gap?: number; inView?: boolean }) {
  const M = tagOf(as);
  const variants: Variants = { hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: gap } } };
  const trigger = inView ? { whileInView: "show", viewport: { once: true, amount: 0.2 } } : { animate: "show" };
  return <M initial="hidden" variants={variants} {...trigger} {...rest} />;
}

export function StaggerItem({ as = "div", ...rest }: Omit<BaseProps, "delay" | "y">) {
  const M = tagOf(as);
  return <M variants={item} {...rest} />;
}

export function SpringNumber({
  from,
  to,
  className = "",
  duration = 1.2,
  delay = 0.15,
}: {
  from: number;
  to: number;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const value = useSpring(from, { visualDuration: duration, bounce: 0, restDelta: 0.5 });
  const text = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduce) return value.jump(to);
    if (!seen) return;
    const t = setTimeout(() => value.set(to), delay * 1000);
    return () => clearTimeout(t);
  }, [seen, reduce, to, delay, value]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {text}
    </motion.span>
  );
}

export function PressButton({ whileTap, transition, ...rest }: HTMLMotionProps<"button">) {
  return <motion.button whileTap={whileTap ?? { scale: 0.97 }} transition={transition ?? spring.snappy} {...rest} />;
}

export function Press({ children, className = "inline-flex" }: { children: ReactNode; className?: string }) {
  return (
    <motion.span className={className} whileTap={{ scale: 0.97 }} transition={spring.snappy}>
      {children}
    </motion.span>
  );
}
