"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ busy, children, disabled, ...rest }: ComponentProps<"button"> & { busy?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} disabled={disabled || pending} aria-busy={pending || undefined}>
      {pending && busy ? busy : children}
    </button>
  );
}
