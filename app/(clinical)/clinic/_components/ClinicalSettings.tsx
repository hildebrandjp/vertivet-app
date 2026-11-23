"use client";

import { useState, useTransition } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Alert } from "@/app/shared/ui/Alert";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import {
  BellIcon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TextInput } from "@/app/shared/ui/TextInput";
import { TextLink } from "@/app/shared/ui/TextLink";
import { Heading, Text } from "@/app/shared/ui/Typography";
import type {
  PracticeOperations,
  PracticeSettings,
  SettingsPatch,
} from "../_lib/settings";
import styles from "../settings.module.css";
import { savePracticeSettings } from "../settings-actions";
import {
  AlertsPanel,
  PharmacyPanel,
  RoomAllocations,
  RosterPanel,
  TimingPanel,
} from "./SettingsPanels";

const SECTIONS = [
  { id: "profile", name: "Veterinarian Profile", Icon: StethoscopeIcon },
  { id: "rooms", name: "Exam Suites & Rooms", Icon: PlusIcon },
  { id: "roster", name: "Operating Hours & Roster", Icon: ClockIcon },
  { id: "pharmacy", name: "Pharmacy Formularies", Icon: FileTextIcon },
  { id: "alerts", name: "Emergency Alerts", Icon: BellIcon },
] as const;
type Section = (typeof SECTIONS)[number]["id"];

export function ClinicalSettings({
  initial,
  name,
  canManage,
}: {
  initial: PracticeSettings;
  name: string;
  canManage: boolean;
}) {
  const [section, setSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(initial);
  const [profile, setProfile] = useState(initial.profile);
  const [value, setValue] = useState(initial.operations);
  const [editProfile, setEditProfile] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  }>();
  const [pending, startTransition] = useTransition();
  const profileChanged =
    profile.title !== saved.profile.title ||
    profile.license !== saved.profile.license;
  const operationsChanged =
    canManage && JSON.stringify(value) !== JSON.stringify(saved.operations);
  const disabled = !canManage || pending;
  const change = <K extends keyof PracticeOperations>(
    key: K,
    next: PracticeOperations[K],
  ) => {
    setValue((current) => ({ ...current, [key]: next }));
    setFeedback(undefined);
  };
  const panel = { settings: saved, value, change, disabled };

  function save() {
    const patch: SettingsPatch = {
      ...(profileChanged && { profile }),
      ...(operationsChanged && { operations: value }),
    };
    startTransition(async () => {
      try {
        const result = await savePracticeSettings(patch);
        if (!result.ok) {
          setFeedback({ tone: "danger", message: result.message });
          return;
        }
        setSaved(result.settings);
        setProfile(result.settings.profile);
        setValue(result.settings.operations);
        setEditProfile(false);
        setFeedback({ tone: "success", message: "Clinical settings saved." });
      } catch {
        setFeedback({
          tone: "danger",
          message: "The settings couldn’t be saved. Try again.",
        });
      }
    });
  }

  return (
    <>
      <SectionHeader
        as="h1"
        title="Clinical Practice & Staff Settings"
        description="Manage exam room allocations, veterinarian rosters, emergency walk-in buffers, and lab integrations."
      />
      <div className={styles.workspace}>
        <Card padding="sm" className={styles.sidebar}>
          <nav
            aria-label="Clinical settings sections"
            className={styles.navigation}
          >
            {SECTIONS.map(({ id, name, Icon }) => (
              <Button
                key={id}
                variant="ghost"
                startIcon={<Icon />}
                aria-pressed={section === id}
                aria-controls="clinical-settings-panel"
                className={styles.navButton}
                onClick={() => setSection(id)}
              >
                {name}
              </Button>
            ))}
          </nav>
          {saved.helpDesk && (
            <Card variant="muted" padding="sm" className={styles.support}>
              <Text variant="eyebrow" tone="muted">
                Clinical IT Helpdesk
              </Text>
              <Text variant="label" tone="heading">
                {saved.helpDesk}
              </Text>
            </Card>
          )}
        </Card>
        <Card padding="lg" className={styles.panel}>
          {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
          <div className={styles.content} id="clinical-settings-panel">
            {section === "profile" && (
              <>
                <div className={styles.profile}>
                  <Avatar name={name} size="xl" decorative />
                  <div className={styles.identity}>
                    <Heading level={3} as="h2">
                      {name}
                    </Heading>
                    <Text variant="supporting" tone="muted">
                      {[
                        saved.profile.title,
                        saved.profile.license &&
                          `License #${saved.profile.license}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    aria-expanded={editProfile}
                    aria-controls="clinical-credentials"
                    onClick={() => setEditProfile(!editProfile)}
                  >
                    Update Credentials
                  </Button>
                </div>
                <div id="clinical-credentials" hidden={!editProfile}>
                  {editProfile && (
                    <div className={styles.fields}>
                      <Field label="Professional Title" disabled={pending}>
                        <TextInput
                          maxLength={100}
                          value={profile.title}
                          onChange={(event) =>
                            setProfile({
                              ...profile,
                              title: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="License Number" disabled={pending}>
                        <TextInput
                          maxLength={60}
                          value={profile.license}
                          onChange={(event) =>
                            setProfile({
                              ...profile,
                              license: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <TextLink href={ROUTES.forgotPassword}>
                        Reset Account Password
                      </TextLink>
                    </div>
                  )}
                </div>
                <RoomAllocations {...panel} edit={false} />
                <TimingPanel
                  value={value}
                  change={change}
                  disabled={disabled}
                  edit={false}
                />
                <AlertsPanel
                  value={value}
                  change={change}
                  disabled={disabled}
                />
              </>
            )}
            {section === "rooms" && <RoomAllocations {...panel} edit />}
            {section === "roster" && <RosterPanel {...panel} />}
            {section === "pharmacy" && <PharmacyPanel {...panel} />}
            {section === "alerts" && (
              <AlertsPanel value={value} change={change} disabled={disabled} />
            )}
          </div>
          <footer className={styles.footer}>
            <Text variant="supporting" tone="muted">
              {canManage
                ? "Save changes to apply practice settings."
                : "Clinic administrators manage practice-wide settings."}
            </Text>
            <div className={styles.inline}>
              {canManage && (
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setResetOpen(true)}
                >
                  Reset Defaults
                </Button>
              )}
              <Button
                loading={pending}
                disabled={!profileChanged && !operationsChanged}
                onClick={save}
              >
                Save Clinical Settings
              </Button>
            </div>
          </footer>
        </Card>
      </div>
      {resetOpen && (
        <Dialog
          open
          onOpenChange={(open) => setResetOpen(open)}
          title="Reset Practice Defaults"
          description="Load the clinic’s default operational settings into this draft. Save to apply them."
          footer={
            <>
              <Button variant="secondary" onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setValue(saved.defaults);
                  setFeedback(undefined);
                  setResetOpen(false);
                }}
              >
                Load Defaults
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
