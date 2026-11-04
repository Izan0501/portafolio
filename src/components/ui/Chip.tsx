import React from "react";
import { cn } from "@/lib/utils";

/**
 * Chip, ported 1:1 from the artifact's `.iz-trust li` / `.iz-stack li`
 * (docs/reference/artifact-a/Hero.dc.html lines 45-47, 30-31).
 *
 * `trust` = a guarantee pill with a leading limón dot (hero's "Spec antes
 * del código" / "CI en cada push" / "Deploy verificado").
 * `stack` = a technology-name pill in Martian Mono (project stack tags) —
 * proper nouns, never translated, per the plan.
 *
 * The artifact draws the trust dot with `::before`; a real element is used
 * here instead since a server/client component tree has nowhere to hang a
 * bare pseudo-element rule per instance without a CSS Module.
 */

const BASE = "inline-flex items-center rounded-pill bg-carbon shadow-[inset_0_0_0_1px_var(--color-linea)]";

const VARIANT = {
  trust: "gap-[7px] px-[11px] py-1.5 text-[13px] font-semibold text-hueso",
  stack: "px-[9px] py-[5px] font-mono text-[11px] text-texto-2",
} as const;

export type ChipVariant = keyof typeof VARIANT;

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  children: React.ReactNode;
}

export function Chip({ variant = "stack", className, children, ...props }: ChipProps) {
  return (
    <span className={cn(BASE, VARIANT[variant], className)} {...props}>
      {variant === "trust" && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-limon" />}
      {children}
    </span>
  );
}

export default Chip;
