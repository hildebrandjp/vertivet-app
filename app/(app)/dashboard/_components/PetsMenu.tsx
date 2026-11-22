"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { IconButton } from "@/app/shared/ui/Button";
import { DropdownMenu } from "@/app/shared/ui/DropdownMenu";
import { MoreHorizontalIcon } from "@/app/shared/ui/icons";
import type { MenuItem } from "@/app/shared/ui/Menu";

const ITEMS: MenuItem[] = [
  { id: "all", label: "View all pets", href: ROUTES.pets },
  { id: "new", label: "Add new profile", href: ROUTES.newPet },
];

/** "···" actions for the My Pets panel. */
export function PetsMenu() {
  return (
    <DropdownMenu
      align="end"
      items={ITEMS}
      trigger={(props) => (
        <IconButton
          {...props}
          size="sm"
          label="Pet actions"
          icon={<MoreHorizontalIcon />}
        />
      )}
    />
  );
}
