"use client";

import { useState } from "react";

export function SeedButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "busy">("idle");
  return (
    <button
      className="text-meta text-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong disabled:opacity-50"
      disabled={step === "busy"}
      onBlur={() => step === "confirm" && setStep("idle")}
      onClick={async () => {
        if (step === "idle") return setStep("confirm");
        setStep("busy");
        await fetch("/api/dev/seed", { method: "POST", headers: { "x-seed": "1" } });
        window.location.href = "/login?mode=signin";
      }}
    >
      {step === "busy" ? "Resetting…" : step === "confirm" ? "Click again to reset all demo deals" : "Reset demo data"}
    </button>
  );
}
