import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

/**
 * Numbered page control — same mono/limón pill language as this site's
 * gallery tab bar (M11 re-style off the legacy cyan/neon palette; the
 * page/totalPages/onChange logic itself was already sound, kept as-is).
 *
 * Flat props, not a compound `<Pagination.Item>` API: every current and
 * foreseeable use of this is the exact same shape (page/totalPages/onChange)
 * rendered in exactly one place per project detail page — a compound API
 * would only pay for itself if a consumer needed to reorder or omit pieces,
 * which none do here.
 */
export interface PaginationProps {
  /** 1-indexed current page. */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /**
   * Optional, parallel to page number (index 0 = page 1) — used only to
   * build a descriptive aria-label per page ("Go to Talent Hub") instead of
   * the bare page number a sighted user already sees.
   */
  pageLabels?: string[];
  className?: string;
}

export function Pagination({ page, totalPages, onChange, pageLabels, className }: PaginationProps) {
  if (totalPages < 2) return null;

  return (
    <nav aria-label="Section pages" className={cn("flex items-center justify-center gap-2", className)}>
      <button
        aria-label="Previous section"
        className="flex h-9 w-9 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--color-linea)] bg-carbon text-piedra transition-colors duration-200 enabled:hover:border-limon/40 enabled:hover:text-limon disabled:cursor-not-allowed disabled:opacity-30"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        type="button"
      >
        <FiChevronLeft />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            aria-current={isActive ? "page" : undefined}
            aria-label={pageLabels?.[p - 1] ? `Go to ${pageLabels[p - 1]}` : `Go to page ${p}`}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-limon/15 text-limon shadow-[inset_0_0_0_1px_var(--color-limon)]"
                : "bg-transparent text-piedra shadow-[inset_0_0_0_1px_transparent] hover:text-hueso hover:bg-carbon-2",
            )}
            onClick={() => onChange(p)}
            type="button"
          >
            {p}
          </button>
        );
      })}

      <button
        aria-label="Next section"
        className="flex h-9 w-9 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--color-linea)] bg-carbon text-piedra transition-colors duration-200 enabled:hover:border-limon/40 enabled:hover:text-limon disabled:cursor-not-allowed disabled:opacity-30"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        type="button"
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}

export default Pagination;
