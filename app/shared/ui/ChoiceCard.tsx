import type { CSSProperties, ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./ChoiceCard.module.css";
import { CheckIcon } from "./icons";

export interface ChoiceGroupProps {
  /** id of the visible heading that names the group. */
  labelledBy: string;
  /** Minimum card width before the grid wraps (any CSS length). */
  minItemWidth?: string;
  className?: string;
  children: ReactNode;
}

/** Native radio group laid out as a responsive grid of cards. */
export function ChoiceGroup({
  labelledBy,
  minItemWidth = "240px",
  className,
  children,
}: ChoiceGroupProps) {
  return (
    <fieldset
      aria-labelledby={labelledBy}
      className={cx(styles.group, className)}
      style={{ "--choice-min": minItemWidth } as CSSProperties}
    >
      {children}
    </fieldset>
  );
}

export interface ChoiceCardProps {
  /** Radio group name (shared by every card in the group). */
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
  /** badge = check in the top-right corner; none = caller shows the state. */
  indicator?: "badge" | "none";
  /** md = content card; sm = compact chip (e.g. time slots). */
  size?: "md" | "sm";
  /** Accessible name when the visible content is not enough. */
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Selectable card backed by a real radio input: arrow keys move between
 * options, Space selects, and forms receive the value natively.
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  disabled = false,
  indicator = "badge",
  size = "md",
  "aria-label": ariaLabel,
  className,
  children,
}: ChoiceCardProps) {
  return (
    <label
      className={cx(styles.card, className)}
      data-size={size}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        className={styles.input}
        onChange={() => onSelect(value)}
      />
      {children}
      {indicator === "badge" && checked ? (
        <span className={styles.badge} aria-hidden="true">
          <CheckIcon strokeWidth={3} />
        </span>
      ) : null}
    </label>
  );
}
