"use client";

import React, { useRef, useState, useCallback, useMemo, type ReactNode } from "react";
import { m, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { stiffness: 300, damping: 28, mass: 0.5 };

interface CardContext {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
  isHovered: boolean;
}

const ThreeDCardContext = React.createContext<CardContext | null>(null);

function useThreeDCard() {
  const ctx = React.useContext(ThreeDCardContext);
  if (!ctx) throw new Error("ThreeDCardItem must be used inside ThreeDCardBody");
  return ctx;
}

interface ThreeDCardBodyProps {
  children: ReactNode;
  className?: string;
}

export function ThreeDCardBody({ children, className }: ThreeDCardBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const rotateX = useSpring(0, SPRING_CONFIG);
  const rotateY = useSpring(0, SPRING_CONFIG);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = (e.clientY - top - height / 2) / 20;
    rotateX.set(-y);
    rotateY.set(x);
  }, [rotateX, rotateY]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const contextValue = useMemo(() => ({ rotateX, rotateY, isHovered }), [rotateX, rotateY, isHovered]);

  return (
    <ThreeDCardContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={cn("w-full h-full", className)}
        style={{ perspective: "1200px" }}
      >
        <m.div
          className="w-full h-full will-change-transform transform-gpu"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {children}
        </m.div>
      </div>
    </ThreeDCardContext.Provider>
  );
}

interface ThreeDCardItemProps {
  children: ReactNode;
  className?: string;
  translateZ?: number | string;
  as?: React.ElementType;
}

export function ThreeDCardItem({ children, className, translateZ = 0, as: Tag = "div" }: ThreeDCardItemProps) {
  const { isHovered } = useThreeDCard();
  // @ts-expect-error - m() supports any React element but TS is strict here
  const MotionTag = typeof Tag === "string" ? m[Tag] : m.create(Tag);
  
  return (
    <MotionTag
      className={cn("will-change-transform transform-gpu backface-hidden", className)}
      animate={{ translateZ: isHovered ? translateZ : 0 }}
      transition={{ type: "spring", ...SPRING_CONFIG }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </MotionTag>
  );
}

interface ThreeDCardContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function ThreeDCardContainer({ children, className, containerClassName }: ThreeDCardContainerProps) {
  return (
    <div className={cn("flex items-center justify-center p-4", containerClassName)}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </div>
  );
}
