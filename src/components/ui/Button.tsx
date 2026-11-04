import React from "react";
import { cn } from "@/lib/utils";

/**
 * Button, ported 1:1 from the artifact's `.iz-btn` / `.iz-btn-a` / `.iz-btn-b`
 * (docs/reference/artifact-a/Hero.dc.html lines 33-39). Pure CSS transitions
 * (transform + background-color only, per CLAUDE.md), no Framer Motion — a
 * press/hover state this simple doesn't need a JS-driven animation library.
 *
 * `primary` = limón filled (`.iz-btn-a`): the one accent, for the main action.
 * `secondary` = outline (`.iz-btn-b`): everything else.
 *
 * Renders an `<a>` when `href` is given, a `<button>` otherwise — same props
 * either way, so a caller never has to know which element it becomes.
 */

const BASE =
  "inline-flex items-center justify-center gap-2.5 min-h-[46px] px-5 rounded-pill text-[15px] font-semibold no-underline transition-[transform,background-color] duration-[160ms] ease-banco active:scale-[0.97] transform-gpu cursor-pointer";

const VARIANT = {
  primary: "bg-limon text-tinta hover:bg-limon-hover",
  secondary: "bg-transparent text-hueso shadow-[inset_0_0_0_1px_var(--color-linea-fuerte)] hover:bg-carbon-2",
} as const;

export type ButtonVariant = keyof typeof VARIANT;

interface CommonProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type ButtonAsAnchor = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(BASE, VARIANT[variant], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorProps } = props as ButtonAsAnchor;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export default Button;
