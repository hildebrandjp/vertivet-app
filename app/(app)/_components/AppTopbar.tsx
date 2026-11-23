import { Suspense } from "react";
import { BellIcon } from "@/app/shared/ui/icons";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { cx } from "@/app/shared/utils/cx";
import { AppSidebar } from "./AppSidebar";
import styles from "./AppTopbar.module.css";
import { MobileNav } from "./MobileNav";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { QuickSearch } from "./QuickSearch";
import { TopbarNotifications } from "./TopbarNotifications";
import { TopbarUser } from "./TopbarUser";

/**
 * Static topbar shell. The notification bell and the user chip depend on
 * the session, so they stream in behind lightweight placeholders.
 */
export function AppTopbar({ className }: { className?: string }) {
  return (
    <header className={cx(styles.topbar, className)}>
      <Suspense>
        <MobileNav>
          <AppSidebar />
        </MobileNav>
      </Suspense>
      <Suspense>
        <PageBreadcrumb />
      </Suspense>
      <div className={styles.actions}>
        <QuickSearch />
        <Suspense
          fallback={
            <span className={styles.placeholderIcon} aria-hidden="true">
              <BellIcon />
            </span>
          }
        >
          <TopbarNotifications />
        </Suspense>
        <Suspense
          fallback={
            <span className={styles.userPlaceholder} aria-hidden="true">
              <Skeleton shape="circle" width="40px" height="40px" />
              <Skeleton width="88px" />
            </span>
          }
        >
          <TopbarUser />
        </Suspense>
      </div>
    </header>
  );
}
