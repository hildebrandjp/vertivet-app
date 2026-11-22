"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IconButton } from "@/app/shared/ui/Button";
import { SearchIcon } from "@/app/shared/ui/icons";

// Dialog + filtering code is fetched only the first time search opens.
const QuickSearchDialog = dynamic(() =>
  import("./QuickSearchDialog").then((mod) => mod.QuickSearchDialog),
);

/** Search button (and Ctrl/⌘+K shortcut) that opens quick navigation. */
export function QuickSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <IconButton
        label="Search (Ctrl+K)"
        icon={<SearchIcon />}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />
      {open ? <QuickSearchDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
