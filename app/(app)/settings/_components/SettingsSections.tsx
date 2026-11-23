"use client";

import type { ChangeEvent } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import type { FieldErrors } from "@/app/shared/forms/validation";
import { ButtonLink } from "@/app/shared/ui/Button";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { Field } from "@/app/shared/ui/Field";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { CLINIC_CONTACT } from "../../_lib/content";
import type {
  CarePlan,
  OwnerPreferences,
} from "../../_lib/data/settings-types";
import { CONTACT_FIELDS, type ContactField } from "../_lib/settings-form";
import styles from "../settings.module.css";

const CONTACT_INPUTS = {
  fullName: { label: "Full Legal Name", autoComplete: "name" },
  email: { label: "Email Address", type: "email", autoComplete: "email" },
  phone: { label: "Mobile Phone Number", type: "tel", autoComplete: "tel" },
  clinicBranch: { label: "Primary Clinic Branch" },
  emergencyPhone: { label: "Emergency Contact Number", type: "tel" },
} as const;

interface ContactProps {
  draft: OwnerPreferences;
  errors: FieldErrors<ContactField>;
  onChange: (field: ContactField, value: string) => void;
}

function ContactFields({
  draft,
  errors,
  onChange,
  names,
}: ContactProps & { names: ContactField[] }) {
  return (
    <div className={styles.fields}>
      {names.map((name) => {
        const { label, ...input } = CONTACT_INPUTS[name];
        return (
          <Field
            key={name}
            label={label}
            error={errors[name]}
            required={name === "fullName" || name === "email"}
          >
            <TextInput
              {...input}
              name={name}
              maxLength={CONTACT_FIELDS[name]}
              value={draft[name]}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(name, event.target.value)
              }
            />
          </Field>
        );
      })}
    </div>
  );
}

export function ContactSection(props: ContactProps) {
  return (
    <section className={styles.section} aria-labelledby="settings-contact">
      <Heading
        id="settings-contact"
        level={4}
        as="h2"
        className={styles.eyebrow}
      >
        Personal Contact Information
      </Heading>
      <ContactFields
        {...props}
        names={["fullName", "email", "phone", "clinicBranch"]}
      />
    </section>
  );
}

const ALERTS = [
  {
    field: "visitReminders",
    label: "SMS & Email Reminders",
    description: "Receive appointment reminders by text message and email.",
  },
  {
    field: "vaccinationAlerts",
    label: "Vaccination & Booster Expiry Alerts",
    description:
      "Receive reminders before your pets’ vaccinations and boosters expire.",
  },
] as const;

type AlertField = (typeof ALERTS)[number]["field"];

export function NotificationSection({
  draft,
  onChange,
}: {
  draft: OwnerPreferences;
  onChange: (field: AlertField, value: boolean) => void;
}) {
  return (
    <section className={styles.section} aria-labelledby="settings-alerts">
      <Heading
        id="settings-alerts"
        level={4}
        as="h2"
        className={styles.eyebrow}
      >
        Visit Reminders &amp; Direct Alerts
      </Heading>
      <div className={styles.alertList}>
        {ALERTS.map(({ field, label, description }) => (
          <label key={field} className={styles.alertRow}>
            <span>
              <Text
                as="span"
                variant="label"
                tone="heading"
                id={`${field}-label`}
              >
                {label}
              </Text>
              <Text
                as="span"
                variant="supporting"
                tone="muted"
                id={`${field}-description`}
              >
                {description}
              </Text>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={draft[field]}
              className={styles.switch}
              aria-labelledby={`${field}-label`}
              aria-describedby={`${field}-description`}
              checked={draft[field]}
              onChange={(event) => onChange(field, event.target.checked)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export function ClinicSection(props: ContactProps) {
  return (
    <section className={styles.section} aria-labelledby="settings-clinic">
      <Heading id="settings-clinic" level={3} as="h2">
        Clinic &amp; Veterinary Facility
      </Heading>
      <Text tone="muted">
        Set your preferred clinic and an alternate number where the clinic can
        reach you in an emergency.
      </Text>
      <ContactFields {...props} names={["clinicBranch", "emergencyPhone"]} />
      <DescriptionList
        items={[
          {
            term: "Clinic support",
            details: (
              <a href={`tel:${CLINIC_CONTACT.phoneHref}`}>
                {CLINIC_CONTACT.phone}
              </a>
            ),
          },
        ]}
      />
    </section>
  );
}

export function CarePlansSection({ plans }: { plans?: CarePlan[] }) {
  return (
    <section className={styles.section} aria-labelledby="settings-care">
      <Heading id="settings-care" level={3} as="h2">
        Care Plans &amp; Insurance
      </Heading>
      {plans?.length ? (
        <ul className={styles.planList}>
          {plans.map((plan) => (
            <li key={plan.id} className={styles.alertRow}>
              <div>
                <Text variant="label" tone="heading">
                  {plan.name}
                </Text>
                <Text variant="supporting" tone="muted">
                  {[plan.provider, plan.reference].filter(Boolean).join(" · ")}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Text tone="muted">
          No care plans or insurance policies are on file. Contact your clinic
          about coverage and enrollment.
        </Text>
      )}
    </section>
  );
}

export function SecuritySection() {
  return (
    <section className={styles.section} aria-labelledby="settings-security">
      <Heading id="settings-security" level={3} as="h2">
        Security &amp; Passwords
      </Heading>
      <Text tone="muted">
        Request a password reset link using the email address on your account.
      </Text>
      <div>
        <ButtonLink href={ROUTES.forgotPassword} variant="secondary">
          Reset Password
        </ButtonLink>
      </div>
    </section>
  );
}
