"use client"

import { cn } from "@/lib/utils"

interface MorphingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MorphingSpinner({ size = "md", className }: MorphingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("relative text-cyan-400", sizeClasses[size], className)}>
      {/* bg-current (not a fixed color) so a consumer can retint via `text-*`
          on the wrapper; this site has no --color-primary token (Tailwind v4,
          no shadcn theme layer), so bg-primary would render invisible here. */}
      <div className="absolute inset-0 animate-[smoothMorph_3s_ease-in-out_infinite] bg-current transform-gpu will-change-transform drop-shadow-[0_0_10px_currentColor]" />

      <style jsx>{`
        @keyframes smoothMorph {
          0% {
            transform: scale(1) rotate(0deg);
            border-radius: 50%;
          }
          20% {
            transform: scale(0.9) rotate(72deg);
            border-radius: 35%;
          }
          40% {
            transform: scale(1.1) rotate(144deg);
            border-radius: 15%;
          }
          60% {
            transform: scale(0.85) rotate(216deg);
            border-radius: 8%;
          }
          80% {
            transform: scale(1.05) rotate(288deg);
            border-radius: 25%;
          }
          100% {
            transform: scale(1) rotate(360deg);
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  )
}
