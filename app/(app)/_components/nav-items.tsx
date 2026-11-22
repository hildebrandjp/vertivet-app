import { type ReactNode, Suspense } from "react";
import {
  CalendarIcon,
  FileTextIcon,
  HeartIcon,
  HomeIcon,
  SettingsIcon,
} from "@/app/shared/ui/icons";
import type { SidebarItem } from "@/app/shared/ui/Sidebar";
import { APP_NAV, type NavId } from "../_lib/navigation";
import { NavCountBadge } from "./NavCountBadge";

const NAV_ICONS: Record<NavId, ReactNode> = {
  dashboard: <HomeIcon />,
  pets: <HeartIcon />,
  appointments: <CalendarIcon />,
  medicalRecords: <FileTextIcon />,
  settings: <SettingsIcon />,
};

/** Per-user counters stream in; the link renders immediately without them. */
const NAV_BADGES: Partial<Record<NavId, ReactNode>> = {
  pets: (
    <Suspense fallback={null}>
      <NavCountBadge kind="pets" />
    </Suspense>
  ),
  appointments: (
    <Suspense fallback={null}>
      <NavCountBadge kind="appointmentsToday" />
    </Suspense>
  ),
};

/** Sidebar items for both the desktop sidebar and the mobile drawer. */
export const SIDEBAR_ITEMS: SidebarItem[] = APP_NAV.map((entry) => ({
  href: entry.href,
  label: entry.label,
  icon: NAV_ICONS[entry.id],
  badge: NAV_BADGES[entry.id],
}));
