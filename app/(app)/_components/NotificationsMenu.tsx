"use client";

import { useMemo } from "react";
import { DropdownMenu } from "@/app/shared/ui/DropdownMenu";
import { BellIcon } from "@/app/shared/ui/icons";
import type { MenuItem } from "@/app/shared/ui/Menu";
import { pluralize } from "@/app/shared/utils/text";
import type { AppNotification } from "../_lib/data/types";
import styles from "./NotificationsMenu.module.css";

/** Bell with an unread dot, listing recent notifications. */
export function NotificationsMenu({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const unread = notifications.filter((n) => !n.read).length;

  const items = useMemo<MenuItem[]>(
    () =>
      notifications.length > 0
        ? notifications.map((n) => ({
            id: n.id,
            label: n.read ? n.title : <strong>{n.title}</strong>,
            href: n.href,
          }))
        : [{ id: "empty", label: "You're all caught up", disabled: true }],
    [notifications],
  );

  const label =
    unread > 0
      ? `Notifications, ${pluralize(unread, "unread")}`
      : "Notifications";

  return (
    <DropdownMenu
      align="end"
      items={items}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className={styles.trigger}
          aria-label={label}
          title={label}
        >
          <BellIcon />
          {unread > 0 ? (
            <span className={styles.dot} aria-hidden="true" />
          ) : null}
        </button>
      )}
    />
  );
}
