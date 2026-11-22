"use client";

import { useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Breadcrumb } from "@/app/shared/ui/Breadcrumb";
import { Button } from "@/app/shared/ui/Button";
import { DropdownMenu } from "@/app/shared/ui/DropdownMenu";
import { Menubar } from "@/app/shared/ui/Menubar";
import { Pagination } from "@/app/shared/ui/Pagination";
import { Demo, ShowcaseGroup } from "../_components/Demo";
import { ACTION_ITEMS, MENUBAR } from "../_data/showcase-data";
import styles from "../showcase.module.css";

const BREADCRUMB = [
  { label: "Home", href: "/" },
  { label: "Patients", href: "/patients" },
  { label: "Luna" },
];

/** 05, 06, 15, 16, 17 + feedback: buttons, menus and navigation. */
export default function ActionsSection() {
  const [page, setPage] = useState(2);
  const [alertOpen, setAlertOpen] = useState(true);

  return (
    <ShowcaseGroup
      title="Actions & navigation"
      description="Buttons, menus, paths and feedback."
    >
      <Demo index="05" title="Breadcrumb" subtitle="Navigation path.">
        <Breadcrumb items={BREADCRUMB} />
      </Demo>

      <Demo index="06" title="Button" subtitle="Primary and secondary actions.">
        <Button fullWidth>Book appointment</Button>
        <Button fullWidth variant="secondary">
          View patient
        </Button>
        <Button fullWidth disabled>
          Book appointment
        </Button>
        <div className={styles.row}>
          <Button size="sm" variant="ghost">
            Ghost
          </Button>
          <Button size="sm" variant="accent">
            Accent
          </Button>
          <Button size="sm" variant="danger">
            Delete
          </Button>
          <Button size="sm" loading>
            Saving
          </Button>
        </div>
      </Demo>

      <Demo index="15" title="Dropdown Menu" subtitle="Contextual actions.">
        <DropdownMenu label="Appointment actions" items={ACTION_ITEMS} />
      </Demo>

      <Demo index="16" title="Menubar" subtitle="Top navigation.">
        <Menubar menus={MENUBAR} />
      </Demo>

      <Demo index="17" title="Pagination" subtitle="Page navigation.">
        <Pagination page={page} pageCount={3} onPageChange={setPage} />
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
      </Demo>

      <Demo index="20" title="Alert" subtitle="Inline feedback banners.">
        {alertOpen ? (
          <Alert
            tone="danger"
            title="Invalid login attempt"
            onDismiss={() => setAlertOpen(false)}
          >
            The clinic email or password entered does not match our records.
          </Alert>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAlertOpen(true)}
          >
            Show alert again
          </Button>
        )}
        <Alert tone="success" title="Appointment booked">
          Luna is booked for 23 October at 10:30 AM.
        </Alert>
        <Alert tone="warning" title="Vaccine due">
          Rabies booster due in 14 days.
        </Alert>
      </Demo>
    </ShowcaseGroup>
  );
}
