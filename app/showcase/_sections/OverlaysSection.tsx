"use client";

import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionItem } from "@/app/shared/ui/Accordion";
import { Button } from "@/app/shared/ui/Button";
import { Collapsible } from "@/app/shared/ui/Collapsible";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { ConfirmDialog } from "@/app/shared/ui/Dialog";
import { Drawer } from "@/app/shared/ui/Drawer";
import { Text } from "@/app/shared/ui/Typography";
import { Demo, ShowcaseGroup } from "../_components/Demo";
import styles from "../showcase.module.css";

const PATIENT_RECORD = [
  { term: "Owner", details: "Sarah Mitchell" },
  { term: "Age", details: "3 years" },
  { term: "Weight", details: "24.5 kg" },
  { term: "Next visit", details: "23 Oct 2026" },
];

/** 02, 12, 13, 19: disclosure and modal surfaces. */
export default function OverlaysSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const confirm = () => {
    setSaving(true);
    timer.current = setTimeout(() => {
      setSaving(false);
      setDialogOpen(false);
    }, 1200);
  };

  return (
    <ShowcaseGroup
      title="Disclosure & overlays"
      description="Expandable sections, dialogs and drawers."
    >
      <Demo
        index="02"
        title="Accordion"
        subtitle="Expandable content sections."
      >
        <Accordion defaultValue={["vaccination"]}>
          <AccordionItem value="vaccination" title="Vaccination history">
            Rabies · 23 Oct 2026
            <br />
            Distemper · 23 Oct 2026
          </AccordionItem>
          <AccordionItem value="allergies" title="Allergies">
            No known allergies.
          </AccordionItem>
        </Accordion>
      </Demo>

      <Demo index="12" title="Dialog" subtitle="Modal confirmation.">
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <ConfirmDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Confirm appointment"
          description="Book Luna's wellness visit with Dr. Emma Wilson on 23 October at 10:30 AM?"
          loading={saving}
          onConfirm={confirm}
        />
      </Demo>

      <Demo index="13" title="Drawer" subtitle="Sidebar navigation.">
        <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
          Open patient details
        </Button>
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Patient details"
          subtitle="Luna · Labrador Retriever"
          footer={<Button fullWidth>View full record</Button>}
        >
          <Text variant="eyebrow" className={styles.drawerEyebrow}>
            Patient record
          </Text>
          <DescriptionList items={PATIENT_RECORD} />
        </Drawer>
      </Demo>

      <Demo index="19" title="Collapsible" subtitle="Expandable section.">
        <Collapsible title="Medical history" defaultOpen>
          No previous conditions recorded.
          <br />
          Last reviewed: 23 October 2026
        </Collapsible>
        <Collapsible title="Medical history">Nothing to show.</Collapsible>
      </Demo>
    </ShowcaseGroup>
  );
}
