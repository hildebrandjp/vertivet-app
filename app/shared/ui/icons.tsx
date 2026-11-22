import type { ReactNode, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Pixel size; defaults to 1em so icons scale with surrounding text. */
  size?: number | string;
}

/** Builds a stroke icon on a 24×24 grid that inherits `currentColor`. */
function createIcon(displayName: string, paths: ReactNode) {
  function Icon({ size = "1em", strokeWidth = 2, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {paths}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

export const ChevronDownIcon = createIcon(
  "ChevronDownIcon",
  <path d="m6 9 6 6 6-6" />,
);
export const ChevronUpIcon = createIcon(
  "ChevronUpIcon",
  <path d="m18 15-6-6-6 6" />,
);
export const ChevronLeftIcon = createIcon(
  "ChevronLeftIcon",
  <path d="m15 18-6-6 6-6" />,
);
export const ChevronRightIcon = createIcon(
  "ChevronRightIcon",
  <path d="m9 18 6-6-6-6" />,
);
export const ChevronsUpDownIcon = createIcon(
  "ChevronsUpDownIcon",
  <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />,
);
export const CheckIcon = createIcon("CheckIcon", <path d="M20 6 9 17l-5-5" />);
export const CloseIcon = createIcon(
  "CloseIcon",
  <path d="M18 6 6 18M6 6l12 12" />,
);
export const PlusIcon = createIcon("PlusIcon", <path d="M12 5v14M5 12h14" />);
export const MinusIcon = createIcon("MinusIcon", <path d="M5 12h14" />);
export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);
export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </>,
);
export const ArrowUpIcon = createIcon(
  "ArrowUpIcon",
  <path d="M12 19V5M5 12l7-7 7 7" />,
);
export const ArrowDownIcon = createIcon(
  "ArrowDownIcon",
  <path d="M12 5v14M19 12l-7 7-7-7" />,
);
