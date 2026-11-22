"use client";

import { useRouter } from "next/navigation";
import { type KeyboardEvent, useId, useMemo, useState } from "react";
import { Dialog } from "@/app/shared/ui/Dialog";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import { SearchIcon } from "@/app/shared/ui/icons";
import { TextInput } from "@/app/shared/ui/TextInput";
import { APP_NAV, QUICK_ACTIONS } from "../_lib/navigation";
import styles from "./QuickSearchDialog.module.css";

const DESTINATIONS = [
  ...APP_NAV.map(({ href, label }) => ({ href, label, group: "Pages" })),
  ...QUICK_ACTIONS.map(({ href, label }) => ({
    href,
    label,
    group: "Actions",
  })),
];

/** Filterable jump list: type, ↑/↓ to choose, Enter to go. */
export function QuickSearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? DESTINATIONS.filter((d) => d.label.toLowerCase().includes(needle))
      : DESTINATIONS;
  }, [query]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[Math.min(active, results.length - 1)].href);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => (open ? undefined : onClose())}
      title="Quick search"
      size="md"
      showCloseButton
    >
      <InputGroup startAddon={<SearchIcon />}>
        <TextInput
          type="search"
          role="combobox"
          aria-label="Search pages and actions"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={
            results.length ? `${listId}-${active}` : undefined
          }
          placeholder="Search pages and actions…"
          value={query}
          autoFocus
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </InputGroup>

      <div
        id={listId}
        role="listbox"
        tabIndex={-1}
        aria-label="Results"
        className={styles.results}
      >
        {results.length === 0 ? (
          <p className={styles.empty}>No matches for “{query}”.</p>
        ) : (
          results.map((item, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled on the input.
            <div
              key={item.href}
              id={`${listId}-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              className={styles.result}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(item.href)}
            >
              <span>{item.label}</span>
              <span className={styles.group}>{item.group}</span>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}
