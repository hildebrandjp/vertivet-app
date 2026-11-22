"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/app/shared/ui/Breadcrumb";
import { getBreadcrumbs } from "../_lib/navigation";
import styles from "./PageBreadcrumb.module.css";

/** Trail for the current page, derived from the navigation map. */
export function PageBreadcrumb() {
  const pathname = usePathname();
  return (
    <Breadcrumb
      items={getBreadcrumbs(pathname)}
      className={styles.breadcrumb}
    />
  );
}
