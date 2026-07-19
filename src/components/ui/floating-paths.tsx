"use client";

import React, { useMemo } from "react";
import { m } from "motion/react";

interface FloatingPathsProps {
  position: number;
}

export const FloatingPaths: React.FC<FloatingPathsProps> = ({ position }) => {
  // Deterministic calculation for zero SSR hydration mismatch errors
  const paths = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      // Progressive opacity from 0.15 up to a vivid 0.85 for maximum visibility
      const baseOpacity = 0.15 + (i / 36) * 0.7;
      
      // Alternate between Architectural White and Cyber Cyan for high-tech depth
      const strokeColor =
        i % 3 === 0
          ? `rgba(34, 211, 238, ${baseOpacity})` // Vivid Cyan
          : `rgba(255, 255, 255, ${baseOpacity * 0.8})`; // Crisp White

      return {
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: strokeColor,
        width: 0.8 + (i % 4) * 0.4, // Thicker, clearer stroke widths (0.8px to 2.0px)
        duration: 18 + (i % 8) * 2, // Smooth 18s to 32s loops
        delay: (i % 6) * 0.5,
      };
    });
  }, [position]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <svg
        className="w-full h-full will-change-transform transform-gpu opacity-90"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="none"
      >
        <title>Engineering Architecture Paths</title>
        {paths.map((path) => (
          <m.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            initial={{ pathLength: 0.2, opacity: 0.3 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.9, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              delay: path.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
