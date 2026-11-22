"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Trailing content, e.g. a count <Badge>. */
  badge?: ReactNode;
  /** exact = only this URL; prefix = this URL and its children (default). */
  match?: "exact" | "prefix";
}

export interface SidebarProps {
  items: SidebarItem[];
  /** Usually <Logo inverse />. */
  header?: ReactNode;
  footer?: ReactNode;
  /** Override the active link (defaults to the current pathname). */
  activeHref?: string;
  "aria-label"?: string;
  className?: string;
}

function isActive(item: SidebarItem, current: string) {
  if (item.match === "exact" || item.href === "/") return current === item.href;
  return current === item.href || current.startsWith(`${item.href}/`);
}

/** Navy sidebar with a royal-blue active state (moodboard). */
export function Sidebar({
  items,
  header,
  footer,
  activeHref,
  "aria-label": ariaLabel = "Main navigation",
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname ?? "";

  return (
    <aside className={cx(styles.sidebar, className)}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <nav aria-label={ariaLabel} className={styles.nav}>
        <ul className={styles.list}>
          {items.map((item) => {
            const active = isActive(item, current);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={styles.link}
                >
                  {item.icon ? (
                    <span className={styles.icon}>{item.icon}</span>
                  ) : null}
                  <span className={styles.label}>{item.label}</span>
                  {item.badge ? (
                    <span className={styles.badge}>{item.badge}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </aside>
  );
}
