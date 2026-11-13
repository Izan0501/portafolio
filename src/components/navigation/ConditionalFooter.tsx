"use client";

import React from "react";
import { Footer } from "@/components/navigation/Footer";

/**
 * Used to hide the footer on `/projects/[id]`, back when that page ended
 * in the legacy `ProjectDetail.tsx`'s own "Dynamic Island" action bar — a
 * redundant second exit path. M11's `ProjectView.tsx` has no such exit of
 * its own (just a plain "back" link), so there's no longer a reason to
 * hide the real footer there — kept as its own component (plan M12: not
 * folded back into `layout.tsx`) in case a future route needs the same
 * kind of override again.
 */
export const ConditionalFooter: React.FC = () => {
  return <Footer />;
};
