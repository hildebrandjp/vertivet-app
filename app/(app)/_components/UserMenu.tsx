"use client";

import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { DropdownMenu } from "@/app/shared/ui/DropdownMenu";
import { LogOutIcon, SettingsIcon } from "@/app/shared/ui/icons";
import type { MenuItem } from "@/app/shared/ui/Menu";
import { logout } from "../_lib/actions";
import styles from "./UserMenu.module.css";

interface UserMenuProps {
  name: string;
  avatarUrl: string | null;
}

/** Avatar + name chip opening account actions. */
export function UserMenu({ name, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  const items = useMemo<MenuItem[]>(
    () => [
      {
        id: "settings",
        label: "Account settings",
        icon: <SettingsIcon />,
        onSelect: () => router.push(ROUTES.settings),
      },
      { type: "separator", id: "sep" },
      {
        id: "logout",
        label: "Log out",
        icon: <LogOutIcon />,
        onSelect: () => startSignOut(() => logout()),
      },
    ],
    [router],
  );

  return (
    <DropdownMenu
      align="end"
      items={items}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className={styles.trigger}
          aria-label={`Account menu for ${name}`}
          aria-busy={signingOut || undefined}
        >
          <Avatar name={name} src={avatarUrl} unoptimized decorative />
          <span className={styles.name}>{name}</span>
        </button>
      )}
    />
  );
}
