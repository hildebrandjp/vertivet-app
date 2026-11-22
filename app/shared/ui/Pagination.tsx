import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import styles from "./Pagination.module.css";

export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Page numbers to render, with ellipses for long ranges. The result always has
 * the same length once pageCount is large enough, so the control doesn't jump.
 */
export function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationItem[] {
  const totalSlots = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (pageCount <= totalSlots) return range(1, pageCount);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showStartEllipsis = left > 3;
  const showEndEllipsis = right < pageCount - 2;
  const edgeCount = 3 + siblingCount * 2;

  if (!showStartEllipsis)
    return [...range(1, edgeCount), "end-ellipsis", pageCount];
  if (!showEndEllipsis)
    return [
      1,
      "start-ellipsis",
      ...range(pageCount - edgeCount + 1, pageCount),
    ];
  return [
    1,
    "start-ellipsis",
    ...range(left, right),
    "end-ellipsis",
    pageCount,
  ];
}

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  /** Button mode: called with the new page. */
  onPageChange?: (page: number) => void;
  /** Link mode: build the URL of a page (works in Server Components). */
  getPageHref?: (page: number) => string;
  /** Pages shown on each side of the current page. */
  siblingCount?: number;
  /** compact = icon-only prev/next, small buttons (used in DataTable). */
  variant?: "default" | "compact";
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  "aria-label"?: string;
  className?: string;
}

/** Page navigation (17 Pagination). */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  getPageHref,
  siblingCount = 1,
  variant = "default",
  previousLabel = "Prev",
  nextLabel = "Next",
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  if (pageCount < 1) return null;
  const compact = variant === "compact";

  const renderControl = (
    target: number,
    content: ReactNode,
    options: {
      disabled?: boolean;
      current?: boolean;
      label?: string;
      kind: string;
    },
  ) => {
    const common = {
      className: styles.button,
      "data-kind": options.kind,
      "aria-label": options.label,
      "aria-current": options.current ? ("page" as const) : undefined,
    };
    if (options.disabled) {
      return (
        <span {...common} aria-disabled="true" data-disabled="">
          {content}
        </span>
      );
    }
    if (getPageHref) {
      return (
        <Link {...common} href={getPageHref(target)}>
          {content}
        </Link>
      );
    }
    return (
      <button {...common} type="button" onClick={() => onPageChange?.(target)}>
        {content}
      </button>
    );
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(styles.pagination, className)}
      data-variant={variant}
    >
      <ul className={styles.list}>
        <li>
          {renderControl(
            page - 1,
            <>
              <ChevronLeftIcon />
              {compact ? null : <span>{previousLabel}</span>}
            </>,
            { disabled: page <= 1, label: "Previous page", kind: "step" },
          )}
        </li>
        {getPaginationItems(page, pageCount, siblingCount).map((item) => (
          <li key={item}>
            {typeof item === "number" ? (
              renderControl(item, item, {
                current: item === page,
                label: `Page ${item}`,
                kind: "page",
              })
            ) : (
              <span className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            )}
          </li>
        ))}
        <li>
          {renderControl(
            page + 1,
            <>
              {compact ? null : <span>{nextLabel}</span>}
              <ChevronRightIcon />
            </>,
            { disabled: page >= pageCount, label: "Next page", kind: "step" },
          )}
        </li>
      </ul>
    </nav>
  );
}
