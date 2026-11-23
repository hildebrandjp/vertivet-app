import { type ReactNode, Suspense } from "react";
import { AppSidebar } from "./_components/AppSidebar";
import { AppTopbar } from "./_components/AppTopbar";
import styles from "./app-shell.module.css";

/**
 * Signed-in shell: sidebar + topbar around every app page. The shell is
 * static; per-user pieces (counts, name, notifications) stream into it.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <div className={styles.sidebarSlot}>
        <Suspense>
          <AppSidebar />
        </Suspense>
      </div>
      <div className={styles.body}>
        <AppTopbar className={styles.topbar} />
        <main id="main" tabIndex={-1} className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
