import { Skeleton } from "@/app/shared/ui/Skeleton";
import styles from "./booking.module.css";

/** Static-shell placeholder matching the first step's layout. */
export function BookingSkeleton() {
  return (
    <div className={styles.wizard} aria-busy="true">
      <span className="sr-only">Loading booking form…</span>
      <Skeleton width="min(420px, 100%)" height="32px" />
      <div className={styles.intro}>
        <Skeleton width="min(380px, 80%)" height="36px" />
        <Skeleton width="min(440px, 90%)" />
      </div>
      <div className={styles.section}>
        <Skeleton width="160px" height="28px" />
        <div className={styles.slotSkeletons}>
          <Skeleton shape="rect" height="116px" />
          <Skeleton shape="rect" height="116px" />
        </div>
      </div>
      <div className={styles.section}>
        <Skeleton width="200px" height="28px" />
        <Skeleton shape="rect" height="216px" />
      </div>
    </div>
  );
}
