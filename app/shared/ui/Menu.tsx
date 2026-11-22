"use client";

import Link from "next/link";
import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { cx } from "../utils/cx";
import styles from "./Menu.module.css";

export type MenuItem =
  | {
      type?: "item";
      id: string;
      label: ReactNode;
      onSelect?: () => void;
      /** Navigate instead of running an action. */
      href?: string;
      icon?: ReactNode;
      /** Right-aligned hint, e.g. "⌘E". */
      shortcut?: string;
      disabled?: boolean;
      tone?: "default" | "danger";
    }
  | { type: "separator"; id: string };

export type MenuCloseReason = "select" | "escape" | "tab";
export type MenuFocusTarget = "first" | "last" | "none";

export interface MenuListProps {
  items: MenuItem[];
  id?: string;
  /** id of the element that labels the menu (its trigger). */
  labelledBy?: string;
  /** Which item to focus when the list mounts. */
  initialFocus?: MenuFocusTarget;
  onClose: (reason: MenuCloseReason) => void;
  /** ←/→ pressed inside the menu (used by Menubar to switch menus). */
  onNavigate?: (direction: -1 | 1) => void;
  className?: string;
}

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

/**
 * Keyboard-accessible list of menu items. Shared by DropdownMenu and Menubar.
 * ↑/↓ move, Home/End jump, Enter/Space select, Esc/Tab close.
 */
export function MenuList({
  items,
  id,
  labelledBy,
  initialFocus = "first",
  onClose,
  onNavigate,
  className,
}: MenuListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const getItems = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [],
    );

  useEffect(() => {
    if (initialFocus === "none") return;
    const all = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [],
    );
    (initialFocus === "last" ? all.at(-1) : all[0])?.focus();
  }, [initialFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const all = getItems();
    const index = all.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => all[(i + all.length) % all.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index < 0 ? -1 : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(-1);
        break;
      case "ArrowLeft":
      case "ArrowRight":
        if (onNavigate) {
          event.preventDefault();
          onNavigate(event.key === "ArrowLeft" ? -1 : 1);
        }
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        onClose("escape");
        break;
      case "Tab":
        onClose("tab");
        break;
    }
  };

  return (
    <div
      ref={listRef}
      id={id}
      role="menu"
      tabIndex={-1}
      aria-labelledby={labelledBy}
      className={cx(styles.menu, className)}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        if (item.type === "separator") {
          return <hr key={item.id} className={styles.separator} />;
        }

        const content = (
          <>
            {item.icon ? (
              <span className={styles.icon}>{item.icon}</span>
            ) : null}
            <span className={styles.label}>{item.label}</span>
            {item.shortcut ? (
              <kbd className={styles.shortcut}>{item.shortcut}</kbd>
            ) : null}
          </>
        );
        const common = {
          role: "menuitem" as const,
          tabIndex: -1,
          "aria-disabled": item.disabled || undefined,
          "data-tone": item.tone ?? "default",
          className: styles.item,
        };

        if (item.href && !item.disabled) {
          return (
            <Link
              key={item.id}
              {...common}
              href={item.href}
              onClick={() => {
                item.onSelect?.();
                onClose("select");
              }}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            {...common}
            type="button"
            onClick={() => {
              if (item.disabled) return;
              item.onSelect?.();
              onClose("select");
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
