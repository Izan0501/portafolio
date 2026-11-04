import { motionValue, type MotionValue } from "motion/react";

/**
 * The DOM half of "Lenis → scrollStore mutable → MotionValue y useFrame"
 * (plan §2.2). `scrollStore.p` is a plain number on a mutable object — fine
 * for `useFrame` (R3F reads refs every frame anyway), but Motion's
 * `useTransform` needs an actual `MotionValue` to subscribe to. This is
 * that one value, updated imperatively from `useLenisBridge`'s rAF tick
 * (`scrollPMotionValue.set(scrollStore.p)`), never from `setState` — every
 * chapter's `useTransform(scrollPMotionValue, ...)` re-renders nothing on
 * scroll, it just writes the derived style straight to the DOM.
 */
export const scrollPMotionValue: MotionValue<number> = motionValue(0);
