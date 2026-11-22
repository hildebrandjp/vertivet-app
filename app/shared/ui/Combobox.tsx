"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Option, Size, ValidationState } from "../common";
import { useControllableState } from "../hooks/useControllableState";
import { useDismiss } from "../hooks/useDismiss";
import { DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import styles from "./Combobox.module.css";
import controlStyles from "./Control.module.css";
import { useFieldControl } from "./Field";
import { CheckIcon, ChevronDownIcon } from "./icons";

export type ComboboxOption = Option;

export interface ComboboxProps {
  options: ComboboxOption[];
  /** Controlled selected value (`null` = nothing selected). */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, option: ComboboxOption | null) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Shown in the input while searching. */
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  /** Custom matching; defaults to case-insensitive "label contains query". */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Name of a hidden input carrying the value, for native form posts. */
  name?: string;
  size?: Size;
  state?: ValidationState;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Searchable single select (09 Combobox), following the WAI-ARIA combobox
 * pattern: type to filter, ↑/↓ to move, Enter to pick, Esc to close.
 */
export function Combobox({
  options,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  filter = defaultFilter,
  name,
  size,
  state,
  disabled,
  required,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: ComboboxProps) {
  const control = useFieldControl(
    {
      id,
      size,
      state,
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
    },
    DEFAULT_SIZE,
  );
  const generatedId = useId();
  const inputId = control.id ?? `combobox-${generatedId}`;
  const listId = `${inputId}-listbox`;
  const optionId = (index: number) => `${inputId}-option-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue,
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = options.find((o) => o.value === selected) ?? null;
  const filtered = useMemo(
    () => (query ? options.filter((o) => filter(o, query)) : options),
    [filter, options, query],
  );

  const firstEnabled = useCallback(
    (list: ComboboxOption[]) => list.findIndex((o) => !o.disabled),
    [],
  );

  const openList = () => {
    if (control.disabled) return;
    setOpen(true);
    const selectedIndex = filtered.findIndex((o) => o.value === selected);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled(filtered));
  };

  const closeList = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setSelected(option.value);
    onValueChange?.(option.value, option);
    closeList();
  };

  useDismiss(rootRef, open, closeList);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(`${inputId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, inputId, open]);

  const move = (direction: 1 | -1) => {
    if (filtered.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < filtered.length; i++) {
      next = (next + direction + filtered.length) % filtered.length;
      if (!filtered[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) move(1);
        else openList();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) move(-1);
        else openList();
        break;
      case "Enter":
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          event.preventDefault();
          choose(filtered[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          closeList();
        }
        break;
      case "Tab":
        closeList();
        break;
    }
  };

  return (
    <div ref={rootRef} className={cx(styles.combobox, className)}>
      <div className={controlStyles.affixWrapper}>
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-invalid={control.invalid}
          aria-describedby={control.describedBy}
          aria-required={control.required || undefined}
          disabled={control.disabled}
          value={open ? query : (selectedOption?.label ?? "")}
          placeholder={open ? searchPlaceholder : placeholder}
          data-size={control.size}
          data-state={control.state}
          className={controlStyles.control}
          onClick={() => (open ? closeList() : openList())}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            const next = event.target.value
              ? options.filter((o) => filter(o, event.target.value))
              : options;
            setActiveIndex(firstEnabled(next));
          }}
          onKeyDown={handleKeyDown}
        />
        <span className={controlStyles.affixIcon} data-open={open || undefined}>
          <ChevronDownIcon />
        </span>
      </div>

      {name ? <input type="hidden" name={name} value={selected ?? ""} /> : null}

      <div className={styles.popover} hidden={!open}>
        <div
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabel ? undefined : inputId}
          aria-label={ariaLabel}
          className={styles.listbox}
        >
          {filtered.length === 0 ? (
            <div className={styles.empty}>{emptyMessage}</div>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === selected;
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled on the combobox input.
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-active={index === activeIndex || undefined}
                  className={styles.option}
                  // Keep focus in the input while clicking an option.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => {
                    if (!option.disabled && index !== activeIndex)
                      setActiveIndex(index);
                  }}
                  onClick={() => choose(option)}
                >
                  <span className={styles.check} aria-hidden="true">
                    {isSelected ? <CheckIcon /> : null}
                  </span>
                  <span className={styles.optionLabel}>{option.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
