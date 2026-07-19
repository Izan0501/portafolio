"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { m, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

// ─── Module-scope cached Intl.Segmenter singleton (constructed once) ─────────

const graphemeSegmenter: Intl.Segmenter | null =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("en", { granularity: "grapheme" })
    : null;

const splitIntoCharacters = (text: string): string[] => {
  if (graphemeSegmenter) {
    return Array.from(
      graphemeSegmenter.segment(text),
      ({ segment }) => segment
    );
  }
  return Array.from(text);
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

interface TextProps {
  children: React.ReactNode;
  reverse?: boolean;
  transition?: Transition;
  splitBy?: "words" | "characters" | "lines" | string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

const VerticalCutReveal = forwardRef<VerticalCutRevealRef, TextProps>(
  (
    {
      children,
      reverse = false,
      transition = {
        type: "spring",
        stiffness: 190,
        damping: 22,
      },
      splitBy = "words",
      staggerDuration = 0.2,
      staggerFrom = "first",
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text =
      typeof children === "string" ? children : children?.toString() ?? "";
    const [isAnimating, setIsAnimating] = useState(false);

    // ── Split text based on splitBy param ──────────────────────────────────
    const elements = useMemo<WordObject[] | string[]>(() => {
      const words = text.split(" ");
      if (splitBy === "characters") {
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === "words") return text.split(" ");
      if (splitBy === "lines") return text.split("\n");
      return text.split(splitBy);
    }, [text, splitBy]);

    // ── Stagger delay calculation ──────────────────────────────────────────
    const getStaggerDelay = useCallback(
      (index: number): number => {
        const total =
          splitBy === "characters"
            ? (elements as WordObject[]).reduce(
                (acc, word) =>
                  acc + word.characters.length + (word.needsSpace ? 1 : 0),
                0
              )
            : elements.length;

        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          const randomIndex = Math.floor(Math.random() * total);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [elements, staggerFrom, staggerDuration, splitBy]
    );

    // ── Imperative handle ──────────────────────────────────────────────────
    const startAnimation = useCallback(() => {
      // eslint-disable-next-line react-doctor/no-adjust-state-on-prop-change
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
    }));

    // eslint-disable-next-line react-doctor/no-adjust-state-on-prop-change
    useEffect(() => {
      if (autoStart) {
        startAnimation();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startAnimation]);

    // ── Animation variants ─────────────────────────────────────────────────
    const variants = {
      hidden: { y: reverse ? "-100%" : "100%" },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay:
            (typeof (transition as { delay?: number })?.delay === "number"
              ? (transition as { delay?: number }).delay!
              : 0) + getStaggerDelay(i),
        },
      }),
    };

    // ── Normalise elements into WordObject[] for unified render path ────────
    const wordObjects: WordObject[] =
      splitBy === "characters"
        ? (elements as WordObject[])
        : (elements as string[]).map((el, i) => ({
            characters: [el],
            needsSpace: i !== elements.length - 1,
          }));

    return (
      <span
        className={cn(
          containerClassName,
          "flex flex-wrap whitespace-pre-wrap",
          splitBy === "lines" && "flex-col"
        )}
        ref={containerRef}
        {...(onClick
          ? {
              onClick,
              role: "button" as const,
              tabIndex: 0,
              onKeyDown: (e: React.KeyboardEvent<HTMLSpanElement>) => {
                if (e.key === "Enter" || e.key === " ") onClick();
              },
            }
          : {})}
      >
        {/* Screen reader text */}
        <span className="sr-only">{text}</span>

        {wordObjects.map((wordObj, wordIndex, array) => {
          const previousCharsCount = array
            .slice(0, wordIndex)
            .reduce((sum, word) => sum + word.characters.length, 0);

          // Stable key: content + position (content-derived, not pure index)
          const wordKey = `word-${wordIndex}-${wordObj.characters.join("")}`;

          return (
            <span
              key={wordKey}
              aria-hidden="true"
              className={cn(
                "inline-flex overflow-hidden",
                wordLevelClassName
              )}
            >
              {wordObj.characters.map((char, charIndex) => {
                const charKey = `char-${previousCharsCount + charIndex}-${char}`;
                return (
                  <span
                    className={cn(
                      elementLevelClassName,
                      "whitespace-pre-wrap relative"
                    )}
                    key={charKey}
                  >
                    <m.span
                      custom={previousCharsCount + charIndex}
                      initial="hidden"
                      animate={isAnimating ? "visible" : "hidden"}
                      variants={variants}
                      onAnimationComplete={
                        wordIndex === wordObjects.length - 1 &&
                        charIndex === wordObj.characters.length - 1
                          ? onComplete
                          : undefined
                      }
                      className="inline-block will-change-transform transform-gpu"
                    >
                      {char}
                    </m.span>
                  </span>
                );
              })}
              {wordObj.needsSpace && <span>{" "}</span>}
            </span>
          );
        })}
      </span>
    );
  }
);

VerticalCutReveal.displayName = "VerticalCutReveal";

export { VerticalCutReveal };
