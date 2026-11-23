"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { Field } from "@/app/shared/ui/Field";
import { PasswordInput } from "@/app/shared/ui/PasswordInput";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Heading, Text } from "@/app/shared/ui/Typography";
import styles from "./workspace.module.css";

interface Snapshot {
  me: { name: string; clinic: string };
  patients: { id: string; name: string; owner: string; species: string }[];
  appointments: {
    id: string;
    patient: string;
    startsAt: string;
    reason: string;
  }[];
}

async function graphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const result: { data?: T; errors?: { message: string }[] } =
    await response.json();
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(
      result.errors?.[0]?.message ?? "The request could not be completed.",
    );
  }
  return result.data;
}

const LOAD =
  "{ me { name clinic } patients { id name owner species } appointments { id patient startsAt reason } }";

export function Workspace() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const load = () => graphql<Snapshot>(LOAD).then(setSnapshot);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const { me } = await graphql<{ me: Snapshot["me"] | null }>(
          "{ me { name clinic } }",
        );
        if (me && active) {
          const result = await graphql<Snapshot>(LOAD);
          if (active) setSnapshot(result);
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load the workspace.",
          );
      } finally {
        if (active) setReady(true);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  async function run(work: () => Promise<void>) {
    setError("");
    setPending(true);
    try {
      await work();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The request could not be completed.",
      );
    } finally {
      setPending(false);
    }
  }

  function submit(
    event: FormEvent<HTMLFormElement>,
    action: "login" | "patient" | "appointment",
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void run(async () => {
      if (action === "login") {
        await graphql(
          "mutation($clinic:String!,$email:String!,$password:String!){signIn(clinic:$clinic,email:$email,password:$password)}",
          values,
        );
      } else if (action === "patient") {
        await graphql(
          "mutation($name:String!,$species:Species!,$owner:String!,$email:String!){registerPatient(name:$name,species:$species,owner:$owner,email:$email){id}}",
          values,
        );
      } else {
        const startsAt = new Date(String(values.startsAt));
        if (!Number.isFinite(+startsAt))
          throw new Error("Choose a valid appointment time.");
        await graphql(
          "mutation($patientId:ID!,$startsAt:String!,$reason:String!){bookAppointment(patientId:$patientId,startsAt:$startsAt,reason:$reason){id}}",
          { ...values, startsAt: startsAt.toISOString() },
        );
      }
      await load();
      form.reset();
    });
  }

  return (
    <>
      {error && <Alert tone="danger">{error}</Alert>}
      {!ready ? (
        <Text>Loading workspace…</Text>
      ) : !snapshot ? (
        <Card className={styles.signIn} padding="lg">
          <Heading level={2}>Clinic Sign-In</Heading>
          <form
            className={styles.form}
            onSubmit={(event) => submit(event, "login")}
          >
            <Field label="Clinic ID" required>
              <TextInput name="clinic" maxLength={80} />
            </Field>
            <Field label="Email" required>
              <TextInput
                name="email"
                autoComplete="username"
                type="email"
                maxLength={254}
              />
            </Field>
            <Field label="Password" required>
              <PasswordInput
                name="password"
                autoComplete="current-password"
                maxLength={256}
              />
            </Field>
            <Button type="submit" loading={pending}>
              Sign In
            </Button>
          </form>
        </Card>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div>
              <Heading level={2}>{snapshot.me.clinic}</Heading>
              <Text tone="muted">{snapshot.me.name}</Text>
            </div>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  await graphql("mutation { signOut }");
                  setSnapshot(null);
                })
              }
            >
              Sign Out
            </Button>
          </div>
          <div className={styles.grid}>
            <Card className={styles.form} padding="lg">
              <Heading level={3}>Register Patient</Heading>
              <form
                className={styles.form}
                onSubmit={(event) => submit(event, "patient")}
              >
                <Field label="Pet Name" required>
                  <TextInput name="name" maxLength={100} />
                </Field>
                <Field label="Species" id="practice-species">
                  <select
                    id="practice-species"
                    name="species"
                    aria-required="true"
                    data-size="md"
                    className={controlStyles.control}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Owner Name" required>
                  <TextInput name="owner" maxLength={100} />
                </Field>
                <Field label="Owner Email" required>
                  <TextInput name="email" type="email" maxLength={254} />
                </Field>
                <Button type="submit" disabled={pending}>
                  Register Patient
                </Button>
              </form>
            </Card>
            <Card className={styles.form} padding="lg">
              <Heading level={3}>Book Appointment</Heading>
              {snapshot.patients.length ? (
                <form
                  className={styles.form}
                  onSubmit={(event) => submit(event, "appointment")}
                >
                  <Field label="Patient" id="practice-patient">
                    <select
                      id="practice-patient"
                      name="patientId"
                      required
                      data-size="md"
                      className={controlStyles.control}
                    >
                      {snapshot.patients.map(({ id, name, owner }) => (
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
                    <TextInput name="reason" maxLength={160} />
                  </Field>
                  <Button type="submit" disabled={pending}>
                    Book Appointment
                  </Button>
                </form>
              ) : (
                <Text tone="muted">Register a patient to book a visit.</Text>
              )}
            </Card>
            <Card padding="lg" className={styles.form}>
              <Heading level={3}>Patients</Heading>
              {snapshot.patients.length ? (
                <ul className={styles.list}>
                  {snapshot.patients.map(({ id, name, owner, species }) => (
                    <li key={id}>
                      <Text variant="label" tone="heading">
                        {name}
                      </Text>
                      <Text variant="supporting" tone="muted">
                        {species} · {owner}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text tone="muted">No patients registered.</Text>
              )}
            </Card>
            <Card padding="lg" className={styles.form}>
              <Heading level={3}>Upcoming Appointments</Heading>
              {snapshot.appointments.length ? (
                <ul className={styles.list}>
                  {snapshot.appointments.map(
                    ({ id, patient, startsAt, reason }) => (
                      <li key={id}>
                        <Text variant="label" tone="heading">
                          {patient} · {reason}
                        </Text>
                        <time dateTime={startsAt}>
                          {new Date(startsAt).toLocaleString()}
                        </time>
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <Text tone="muted">No upcoming appointments.</Text>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
