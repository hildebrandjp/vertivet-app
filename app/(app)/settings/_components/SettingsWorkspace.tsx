"use client";

import { type FormEvent, useState, useTransition } from "react";
import type { FieldErrors } from "@/app/shared/forms/validation";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import {
  BellIcon,
  FileTextIcon,
  HeartIcon,
  SettingsIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { Text } from "@/app/shared/ui/Typography";
import { CLINIC_CONTACT } from "../../_lib/content";
import type {
  OwnerPreferences,
  OwnerSettings,
} from "../../_lib/data/settings-types";
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "../../_lib/format";
import { prepareDemoPhoto } from "../_lib/profile-photo";
import {
  CONTACT_NAMES,
  type ContactField,
  PHOTO_LIMIT,
  PHOTO_TYPES,
  preferencesOf,
} from "../_lib/settings-form";
import { saveSettings } from "../actions";
import styles from "../settings.module.css";
import { ProfileHeader } from "./ProfileHeader";
import {
  CarePlansSection,
  ClinicSection,
  ContactSection,
  NotificationSection,
  SecuritySection,
} from "./SettingsSections";

const SECTIONS = [
  { id: "profile", label: "Profile & Owner Details", icon: HeartIcon },
  { id: "notifications", label: "Notification Alerts", icon: BellIcon },
  {
    id: "clinic",
    label: "Clinic & Veterinary Facility",
    icon: StethoscopeIcon,
  },
  { id: "plans", label: "Care Plans & Insurance", icon: FileTextIcon },
  { id: "security", label: "Security & Passwords", icon: SettingsIcon },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

export function SettingsWorkspace({
  initial,
  demo,
}: {
  initial: OwnerSettings;
  demo: boolean;
}) {
  const [section, setSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(() => preferencesOf(initial));
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors<ContactField>>({});
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  }>();
  const dirty =
    photo !== null ||
    Object.entries(preferencesOf(saved)).some(
      ([key, value]) => draft[key as keyof OwnerPreferences] !== value,
    );
  const busy = pending || photoLoading;
  const savedAt =
    saved.savedAt && Number.isFinite(Date.parse(saved.savedAt))
      ? saved.savedAt
      : undefined;

  function change<K extends keyof OwnerPreferences>(
    key: K,
    value: OwnerPreferences[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(undefined);
  }

  function discard() {
    setDraft(preferencesOf(saved));
    setPhoto(null);
    setErrors({});
    setFeedback(undefined);
  }

  async function choosePhoto(file: File) {
    if (!PHOTO_TYPES.includes(file.type) || file.size > PHOTO_LIMIT) {
      setFeedback({
        tone: "danger",
        message: "Choose a JPEG, PNG, or WebP photo under 750 KB.",
      });
      return;
    }
    setPhotoLoading(true);
    try {
      setPhoto(demo ? await prepareDemoPhoto(file) : file);
      setFeedback(undefined);
    } catch {
      setFeedback({
        tone: "danger",
        message: "This photo couldn’t be opened. Choose a different file.",
      });
    } finally {
      setPhotoLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || busy) return;
    const form = new FormData();
    for (const name of CONTACT_NAMES) form.set(name, draft[name]);
    if (draft.visitReminders) form.set("visitReminders", "on");
    if (draft.vaccinationAlerts) form.set("vaccinationAlerts", "on");
    if (photo) form.set("photo", photo);

    setFeedback(undefined);
    startTransition(async () => {
      try {
        const result = await saveSettings(form);
        if (!result.ok) {
          setErrors(result.fields ?? {});
          setFeedback({ tone: "danger", message: result.message });
          if (result.fields)
            setSection(result.fields.emergencyPhone ? "clinic" : "profile");
          return;
        }
        setSaved(result.settings);
        setDraft(preferencesOf(result.settings));
        setPhoto(null);
        setErrors({});
        setFeedback({ tone: "success", message: "Your settings were saved." });
      } catch {
        setFeedback({
          tone: "danger",
          message: "Your changes couldn’t be saved. Try again.",
        });
      }
    });
  }

  return (
    <div className={styles.workspace}>
      <Card className={styles.sidebar} padding="sm">
        <nav aria-label="Settings sections" className={styles.sectionNav}>
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant="ghost"
              startIcon={<Icon />}
              aria-pressed={section === id}
              aria-controls="owner-settings-panel"
              className={styles.navButton}
              onClick={() => setSection(id)}
            >
              {label}
            </Button>
          ))}
        </nav>
        <div className={styles.support}>
          <Text variant="eyebrow" tone="muted">
            Clinic support
          </Text>
          <a href={`tel:${CLINIC_CONTACT.phoneHref}`}>{CLINIC_CONTACT.phone}</a>
        </div>
      </Card>
      <Card className={styles.panel} padding="lg">
        <form className={styles.form} onSubmit={submit} noValidate>
          {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
          <fieldset
            id="owner-settings-panel"
            className={styles.content}
            disabled={busy}
          >
            <legend className="sr-only">
              {SECTIONS.find(({ id }) => id === section)?.label}
            </legend>
            {section === "profile" && (
              <>
                <ProfileHeader
                  settings={saved}
                  photo={photo}
                  busy={busy}
                  onPhoto={choosePhoto}
                />
                <ContactSection
                  draft={draft}
                  errors={errors}
                  onChange={change}
                />
              </>
            )}
            {(section === "profile" || section === "notifications") && (
              <NotificationSection draft={draft} onChange={change} />
            )}
            {section === "clinic" && (
              <ClinicSection draft={draft} errors={errors} onChange={change} />
            )}
            {section === "plans" && (
              <CarePlansSection plans={saved.carePlans} />
            )}
            {section === "security" && <SecuritySection />}
          </fieldset>
          <footer className={styles.footer}>
            <Text variant="supporting" tone="muted">
              {savedAt ? (
                <time dateTime={savedAt}>
                  Last saved {formatAppointmentDate(savedAt)} at{" "}
                  {formatAppointmentTime(savedAt)}
                </time>
              ) : (
                "Changes apply when you save."
              )}
            </Text>
            <div className={styles.footerActions}>
              <Button
                variant="secondary"
                disabled={!dirty || busy}
                onClick={discard}
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={!dirty || photoLoading}
                loading={pending}
              >
                Save Changes
              </Button>
            </div>
          </footer>
        </form>
      </Card>
    </div>
  );
}
