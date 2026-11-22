"use client";

import { createContext, type ReactNode, useCallback, useContext } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import styles from "./Accordion.module.css";
import { Collapsible, type CollapsibleProps } from "./Collapsible";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  /** single = one item open at a time; multiple = any number. */
  type?: "single" | "multiple";
  /** Controlled list of open item values. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** In single mode, allow closing the open item. */
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

const EMPTY: string[] = [];

/**
 * Group of expandable sections (02 Accordion).
 *
 * @example
 * <Accordion defaultValue={["vaccines"]}>
 *   <AccordionItem value="vaccines" title="Vaccination history">…</AccordionItem>
 * </Accordion>
 */
export function Accordion({
  type = "single",
  value,
  defaultValue = EMPTY,
  onValueChange,
  collapsible = true,
  className,
  children,
}: AccordionProps) {
  const [openValues, setOpenValues] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const isOpen = useCallback(
    (item: string) => openValues.includes(item),
    [openValues],
  );

  const toggle = useCallback(
    (item: string) => {
      const currentlyOpen = openValues.includes(item);
      if (type === "multiple") {
        setOpenValues(
          currentlyOpen
            ? openValues.filter((v) => v !== item)
            : [...openValues, item],
        );
      } else if (!currentlyOpen) {
        setOpenValues([item]);
      } else if (collapsible) {
        setOpenValues([]);
      }
    },
    [collapsible, openValues, setOpenValues, type],
  );

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className={cx(styles.accordion, className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps
  extends Omit<CollapsibleProps, "open" | "defaultOpen" | "onOpenChange"> {
  /** Unique key of this item within the accordion. */
  value: string;
}

export function AccordionItem({ value, ...rest }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context)
    throw new Error("<AccordionItem> must be used inside <Accordion>.");
  return (
    <Collapsible
      {...rest}
      open={context.isOpen(value)}
      onOpenChange={() => context.toggle(value)}
    />
  );
}
