import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A bordered button whose frame draws itself in on hover: four corner dots
 * pop outward, four dashed edges scale in from their nearest corner, and a
 * faint diagonal grid flashes in behind — staggered so it reads as one
 * "frame assembling itself" gesture rather than nine things happening at once.
 *
 * Native Tailwind + CSS only — no iframe, no runtime-loaded CSS engine, no
 * nested interactive elements. Every moving part here is a `transform`/
 * `opacity` transition driven by the browser's own `:hover`/`group-hover`,
 * so it costs nothing at rest and composites on the GPU without a single
 * byte of animation JS. The two dashed-line/grid backgrounds are the only
 * things Tailwind can't express as utility classes (`repeating-linear-
 * gradient` has no utility), so those two stay as inline `style`.
 *
 * Decoration colour comes from `currentColor` on its own inner wrapper
 * (`text-emerald-400` below), independent of the button label's own text
 * colour — same `currentColor`-driven styling contract as this file's
 * sibling components (MorphingSpinner, HandwritingText, RotatingText).
 *
 * `motion-reduce:hidden` drops the whole decorative layer under
 * prefers-reduced-motion — the button still works and still shows a hover
 * state (background/border colour), just without anything moving.
 */
export interface DotBorderButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export function DotBorderButton({ children, className, ...anchorProps }: DotBorderButtonProps) {
  return (
    <a
      {...anchorProps}
      className={cn(
        "group relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-visible",
        "rounded-xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-lg shadow-xl",
        "text-sm font-bold tracking-tight text-white",
        "transition-[transform,letter-spacing,background-color,border-color] duration-300 ease-out will-change-transform transform-gpu",
        "hover:scale-[1.03] hover:tracking-wide hover:border-emerald-400/40 hover:bg-emerald-500/10",
        "motion-reduce:transition-colors motion-reduce:hover:scale-100",
        "sm:w-auto",
        className,
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 text-emerald-400 motion-reduce:hidden">
        {/* Diagonal grid backdrop */}
        <span
          className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 delay-150 group-hover:opacity-100"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 16%, transparent) 0 1px, transparent 2px 6px)",
          }}
        />

        {/* Dashed edges — each scales in from the corner it's staggered after */}
        <span
          className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 delay-150 group-hover:scale-x-100"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 2px, currentColor 2px 4px)" }}
        />
        <span
          className="absolute -right-px top-0 h-full w-px origin-top scale-y-0 transition-transform delay-75 duration-300 group-hover:scale-y-100"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 2px, currentColor 2px 4px)" }}
        />
        <span
          className="absolute -bottom-px left-0 h-px w-full origin-right scale-x-0 transition-transform duration-300 delay-300 group-hover:scale-x-100"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 2px, currentColor 2px 4px)" }}
        />
        <span
          className="absolute -left-px top-0 h-full w-px origin-bottom scale-y-0 transition-transform duration-300 [transition-delay:220ms] group-hover:scale-y-100"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 2px, currentColor 2px 4px)" }}
        />

        {/* Corner dots — pop in just past each corner, one after another */}
        <span className="absolute -top-1 -left-1 h-1.5 w-1.5 scale-0 rounded-[2px] bg-current opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 scale-0 rounded-[2px] bg-current opacity-0 transition-all delay-75 duration-300 group-hover:scale-100 group-hover:opacity-100" />
        <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 scale-0 rounded-[2px] bg-current opacity-0 transition-all duration-300 delay-150 group-hover:scale-100 group-hover:opacity-100" />
        <span className="absolute -bottom-1 -left-1 h-1.5 w-1.5 scale-0 rounded-[2px] bg-current opacity-0 transition-all duration-300 [transition-delay:220ms] group-hover:scale-100 group-hover:opacity-100" />
      </span>

      {children}
    </a>
  );
}

export default DotBorderButton;
