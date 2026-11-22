"use client";

import {
  type KeyboardEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { type DismissReason, useDismiss } from "../hooks/useDismiss";
import { cx } from "../utils/cx";
import { ChevronDownIcon } from "./icons";
import {
  type MenuCloseReason,
  type MenuFocusTarget,
  type MenuItem,
  MenuList,
} from "./Menu";
import styles from "./Menubar.module.css";

export interface MenubarMenu {
  id: string;
  label: string;
  items: MenuItem[];
}

export interface MenubarProps {
  menus: MenubarMenu[];
  "aria-label"?: string;
  className?: string;
}

/**
 * Top navigation menus (16 Menubar): File ⌄  Edit ⌄  View ⌄  Help ⌄.
 * ←/→ move between menus (and switch the open one), ↓/Enter opens.
 */
export function Menubar({
  menus,
  "aria-label": ariaLabel = "Main menu",
  className,
}: MenubarProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [focusTarget, setFocusTarget] = useState<MenuFocusTarget>("first");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const wrap = (index: number) => (index + menus.length) % menus.length;

  const focusTrigger = (index: number) => {
    setFocusIndex(index);
    triggerRefs.current[index]?.focus();
  };

  const openMenu = (index: number, target: MenuFocusTarget) => {
    setFocusIndex(index);
    setFocusTarget(target);
    setOpenIndex(index);
  };

  const close = useCallback(
    (reason: MenuCloseReason | DismissReason) => {
      const index = openIndex;
      setOpenIndex(null);
      if ((reason === "escape" || reason === "select") && index != null) {
        triggerRefs.current[index]?.focus();
      }
    },
    [openIndex],
  );

  useDismiss(rootRef, openIndex != null, close);

  const handleTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        event.preventDefault();
        const next = wrap(index + (event.key === "ArrowRight" ? 1 : -1));
        if (openIndex != null) openMenu(next, "first");
        else focusTrigger(next);
        break;
      }
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openMenu(index, "first");
        break;
      case "ArrowUp":
        event.preventDefault();
        openMenu(index, "last");
        break;
      case "Home":
        event.preventDefault();
        focusTrigger(0);
        break;
      case "End":
        event.preventDefault();
        focusTrigger(menus.length - 1);
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      role="menubar"
      aria-label={ariaLabel}
      className={cx(styles.menubar, className)}
    >
      {menus.map((menu, index) => {
        const isOpen = openIndex === index;
        const triggerId = `${baseId}-${menu.id}-trigger`;
        const menuId = `${baseId}-${menu.id}-menu`;
        return (
          <div key={menu.id} className={styles.menuWrapper}>
            <button
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              id={triggerId}
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? menuId : undefined}
              tabIndex={index === focusIndex ? 0 : -1}
              className={styles.trigger}
              onClick={() =>
                isOpen ? setOpenIndex(null) : openMenu(index, "none")
              }
              onPointerEnter={() => {
                // Once a menu is open, hovering another trigger switches to it.
                if (openIndex != null && !isOpen) openMenu(index, "none");
              }}
              onKeyDown={(event) => handleTriggerKeyDown(event, index)}
            >
              {menu.label}
              <ChevronDownIcon className={styles.chevron} />
            </button>
            {isOpen ? (
              <div className={styles.popover}>
                <MenuList
                  id={menuId}
                  items={menu.items}
                  labelledBy={triggerId}
                  initialFocus={focusTarget}
                  onClose={close}
                  onNavigate={(direction) =>
                    openMenu(wrap(index + direction), "first")
                  }
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
