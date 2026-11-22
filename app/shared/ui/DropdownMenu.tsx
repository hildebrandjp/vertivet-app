"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import type { Size } from "../common";
import { type DismissReason, useDismiss } from "../hooks/useDismiss";
import { cx } from "../utils/cx";
import { Button, type ButtonVariant } from "./Button";
import styles from "./DropdownMenu.module.css";
import { ChevronDownIcon } from "./icons";
import {
  type MenuCloseReason,
  type MenuFocusTarget,
  type MenuItem,
  MenuList,
} from "./Menu";

/** Props to spread on a custom trigger element. */
export interface MenuTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface DropdownMenuProps {
  items: MenuItem[];
  /** Text of the default trigger button. */
  label?: ReactNode;
  /** Render a custom trigger instead of the default button. */
  trigger?: (props: MenuTriggerProps) => ReactNode;
  triggerVariant?: ButtonVariant;
  triggerSize?: Size;
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: "start" | "end";
  defaultOpen?: boolean;
  className?: string;
}

/** Contextual actions (15 Dropdown Menu). */
export function DropdownMenu({
  items,
  label = "Actions",
  trigger,
  triggerVariant = "secondary",
  triggerSize = "md",
  align = "start",
  defaultOpen = false,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [focusTarget, setFocusTarget] = useState<MenuFocusTarget>("none");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  const openMenu = (target: MenuFocusTarget) => {
    setFocusTarget(target);
    setOpen(true);
  };

  const close = useCallback((reason: MenuCloseReason | DismissReason) => {
    setOpen(false);
    if (reason === "escape" || reason === "select") triggerRef.current?.focus();
  }, []);

  useDismiss(rootRef, open, close);

  const triggerProps: MenuTriggerProps = {
    ref: triggerRef,
    id: triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
    onClick: () => (open ? setOpen(false) : openMenu("first")),
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openMenu("first");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openMenu("last");
      }
    },
  };

  return (
    <div ref={rootRef} className={cx(styles.dropdown, className)}>
      {trigger ? (
        trigger(triggerProps)
      ) : (
        <Button
          {...triggerProps}
          variant={triggerVariant}
          size={triggerSize}
          endIcon={<ChevronDownIcon />}
        >
          {label}
        </Button>
      )}
      {open ? (
        <div className={styles.popover} data-align={align}>
          <MenuList
            id={menuId}
            items={items}
            labelledBy={triggerId}
            initialFocus={focusTarget}
            onClose={close}
          />
        </div>
      ) : null}
    </div>
  );
}
