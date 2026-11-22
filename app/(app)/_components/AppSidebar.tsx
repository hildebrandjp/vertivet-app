import Link from "next/link";
import { ROUTES } from "@/app/shared/config/routes";
import { Logo } from "@/app/shared/ui/Logo";
import { Sidebar } from "@/app/shared/ui/Sidebar";
import { LogoutButton } from "./LogoutButton";
import { SIDEBAR_ITEMS } from "./nav-items";

/** Desktop sidebar: logo, main menu, log out. Also reused by MobileNav. */
export function AppSidebar({ className }: { className?: string }) {
  return (
    <Sidebar
      variant="light"
      className={className}
      header={
        <Link href={ROUTES.dashboard} aria-label="VertiVet dashboard">
          <Logo size="sm" />
        </Link>
      }
      sectionLabel="Main menu"
      items={SIDEBAR_ITEMS}
      footer={<LogoutButton />}
    />
  );
}
