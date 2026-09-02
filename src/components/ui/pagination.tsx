import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

/**
 * Numbered page control — same mono/cyan pill language as this site's
 * gallery tab bar, so the two read as one family even though they sit at
 * opposite ends of a section (tabs at top for jumping to any section
 * directly, this at the bottom for moving to the next one in order).
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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/70 text-neutral-400 transition-colors duration-200 enabled:hover:border-cyan-500/40 enabled:hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
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
              "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                : "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/5",
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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/70 text-neutral-400 transition-colors duration-200 enabled:hover:border-cyan-500/40 enabled:hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
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
