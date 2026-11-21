"use client";

import { useEffect, useState } from "react";

export function CountTo({ from, to }: { from: number; to: number }) {
  const [n, setN] = useState(from);
  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  return <span className="tabular-nums">{n}</span>;
}
