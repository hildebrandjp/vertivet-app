"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { IconButton } from "@/app/shared/ui/Button";
import { MenuIcon } from "@/app/shared/ui/icons";
import styles from "./MobileNav.module.css";

// The drawer is only needed after a tap on small screens: load it on demand.
const Drawer = dynamic(() =>
  import("@/app/shared/ui/Drawer").then((mod) => mod.Drawer),
);

/**
 * Hamburger + drawer for screens without the desktop sidebar. `children`
 * is the server-rendered sidebar, so navigation is defined only once.
 */
export function MobileNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close after navigating (state adjusted during render, no effect needed).
  if (open && pathname !== openedAt) {
    setOpen(false);
  }

  return (
    <div className={styles.mobileNav}>
      <IconButton
        label="Open menu"
        icon={<MenuIcon />}
        aria-expanded={open}
        onClick={() => {
          setOpenedAt(pathname);
          setOpen(true);
        }}
      />
      {open ? (
        <Drawer
          open
          onOpenChange={setOpen}
          side="left"
          size="sm"
          title="Menu"
          bodyPadding="none"
        >
          <div className={styles.drawerContent}>{children}</div>
        </Drawer>
      ) : null}
    </div>
  );
}
