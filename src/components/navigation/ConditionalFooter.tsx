"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/navigation/Footer";

/**
 * Project detail pages already end in their own "Dynamic Island" action bar
 * with a return-to-matrix link — the global site footer there is a redundant
 * second exit path, so it's hidden on that route.
 */
export const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  const isProjectDetail = pathname?.startsWith("/projects/");

  if (isProjectDetail) {
    return null;
  }

  return <Footer />;
};
