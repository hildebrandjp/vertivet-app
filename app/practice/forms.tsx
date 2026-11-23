"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { Field } from "@/app/shared/ui/Field";
import { PasswordInput } from "@/app/shared/ui/PasswordInput";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Heading, Text } from "@/app/shared/ui/Typography";
import {
  LIMITS,
  type Patient,
  SPECIES,
  type Species,
} from "@/shared/practice/contracts";
import { api } from "./api";
import styles from "./workspace.module.css";

type Submit = (work: () => Promise<void>) => void;

function PracticeForm({
  submit,
  action,
  pending,
  button,
  children,
}: {
  submit: Submit;
  action: (values: FormData) => Promise<void>;
  pending: boolean;
  button: string;
  children: ReactNode;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    submit(async () => {
      await action(data);
      form.reset();
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {children}
      <Button type="submit" disabled={pending}>
        {button}
      </Button>
    </form>
  );
}

const value = (form: FormData, key: string) => String(form.get(key) ?? "");

export function SignInForm({
  submit,
  pending,
}: {
  submit: Submit;
  pending: boolean;
}) {
  return (
    <Card className={styles.signIn} padding="lg">
      <Heading level={2}>Clinic Sign-In</Heading>
      <PracticeForm
        submit={submit}
        pending={pending}
        button="Sign In"
        action={(data) =>
          api.signIn({
            clinic: value(data, "clinic"),
            email: value(data, "email"),
            password: value(data, "password"),
          })
        }
      >
        <Field label="Clinic ID" required>
          <TextInput name="clinic" maxLength={LIMITS.clinic} />
        </Field>
        <Field label="Email" required>
          <TextInput
            name="email"
            autoComplete="username"
            type="email"
            maxLength={LIMITS.email}
          />
        </Field>
        <Field label="Password" required>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            maxLength={LIMITS.password}
          />
        </Field>
      </PracticeForm>
    </Card>
  );
}

export function PatientForm({
  submit,
  pending,
}: {
  submit: Submit;
  pending: boolean;
}) {
  return (
    <Card className={styles.form} padding="lg">
      <Heading level={3}>Register Patient</Heading>
      <PracticeForm
        submit={submit}
        pending={pending}
        button="Register Patient"
        action={(data) =>
          api.register({
            name: value(data, "name"),
            species: value(data, "species") as Species,
            owner: value(data, "owner"),
            email: value(data, "email"),
          })
        }
      >
        <Field label="Pet Name" required>
          <TextInput name="name" maxLength={LIMITS.name} />
        </Field>
        <Field label="Species" id="practice-species">
          <select
            id="practice-species"
            name="species"
            required
            data-size="md"
            className={controlStyles.control}
          >
            {SPECIES.map((species) => (
              <option key={species} value={species}>
                {species[0].toUpperCase() + species.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner Name" required>
          <TextInput name="owner" maxLength={LIMITS.name} />
        </Field>
        <Field label="Owner Email" required>
          <TextInput name="email" type="email" maxLength={LIMITS.email} />
        </Field>
      </PracticeForm>
    </Card>
  );
}

export function AppointmentForm({
  submit,
  pending,
  patients,
  paged,
}: {
  submit: Submit;
  pending: boolean;
  patients: Patient[];
  paged: boolean;
}) {
  return (
    <Card className={styles.form} padding="lg">
      <Heading level={3}>Book Appointment</Heading>
      {patients.length ? (
        <PracticeForm
          submit={submit}
          pending={pending}
          button="Book Appointment"
          action={(data) => {
            const date = new Date(value(data, "startsAt"));
            if (!Number.isFinite(+date))
              throw new Error("Choose a valid appointment time.");
            return api.book({
              patientId: value(data, "patientId"),
              startsAt: date.toISOString(),
              reason: value(data, "reason"),
            });
          }}
        >
          <Field
            label="Patient"
            id="practice-patient"
            hint={
              paged
                ? "The picker lists patients on the current Patients page."
                : undefined
            }
          >
            <select
              id="practice-patient"
              name="patientId"
              defaultValue={paged ? "" : undefined}
              required
              data-size="md"
              className={controlStyles.control}
            >
              {paged && <option value="">Choose a patient</option>}
              {patients.map(({ id, name, owner }) => (
                <option key={id} value={id}>
                  {name} · {owner}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Appointment Time"
            hint="Uses your device’s local time."
            required
          >
            <TextInput name="startsAt" type="datetime-local" />
          </Field>
          <Field label="Visit Reason" required>
            <TextInput name="reason" maxLength={LIMITS.reason} />
          </Field>
        </PracticeForm>
      ) : (
        <Text tone="muted">No patients are available on this page.</Text>
      )}
    </Card>
  );
}
