import type { ComponentType } from "react";
import { CalendarIcon, type IconProps, InfoIcon } from "@/app/shared/ui/icons";
import { BOOKING_TIPS } from "../../../_lib/content";
import styles from "./schedule.module.css";

const TIP_ICONS: Record<
  (typeof BOOKING_TIPS)[number]["icon"],
  ComponentType<IconProps>
> = {
  info: InfoIcon,
  calendar: CalendarIcon,
};

/** Clinic guidance shown under the scheduling step. */
export function BookingTips() {
  return (
    <ul className={styles.tips} aria-label="Before you book">
      {BOOKING_TIPS.map((tip) => {
        const Icon = TIP_ICONS[tip.icon];
        return (
          <li key={tip.id} className={styles.tip}>
            <h2 className={styles.tipTitle}>
              <span className={styles.tipIcon} aria-hidden="true">
                <Icon />
              </span>
              {tip.title}
            </h2>
            <p className={styles.tipBody}>{tip.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
