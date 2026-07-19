"use client";

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
  staggerDuration?: number;
}

export const TextRotate: React.FC<TextRotateProps> = ({
  texts,
  rotationInterval = 3200,
  className,
  staggerDuration = 0.025,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [texts.length, rotationInterval]);

  const currentText = texts[index];
  const characters = Array.from(currentText);

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center relative overflow-hidden align-top py-0.5",
        className
      )}
    >
      <span className="sr-only">{currentText}</span>
      
      <AnimatePresence mode="wait">
        <m.span
          key={index}
          className="inline-flex flex-wrap whitespace-pre [transform-style:preserve-3d]"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {characters.map((char, charIdx) => (
            <m.span
              key={`${index}-${charIdx}`}
              variants={{
                hidden: {
                  y: "100%",
                  opacity: 0,
                  rotateX: -80,
                  filter: "blur(3px)",
                },
                visible: {
                  y: 0,
                  opacity: 1,
                  rotateX: 0,
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    mass: 0.6,
                    delay: charIdx * staggerDuration,
                  },
                },
                exit: {
                  y: "-100%",
                  opacity: 0,
                  rotateX: 80,
                  filter: "blur(3px)",
                  transition: {
                    duration: 0.18,
                    ease: "easeIn",
                    delay: charIdx * (staggerDuration * 0.5),
                  },
                },
              }}
              className={cn(
                "inline-block will-change-transform transform-gpu backface-hidden font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-emerald-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]",
                char === " " ? "w-[0.28em]" : ""
              )}
            >
              {char}
            </m.span>
          ))}
        </m.span>
      </AnimatePresence>
    </span>
  );
};
