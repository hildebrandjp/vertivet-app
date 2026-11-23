"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { Heading, Text } from "@/app/shared/ui/Typography";
import {
  type Page,
  WORKSPACE_PAGE_SIZE,
  type WorkspaceSnapshot,
} from "@/shared/practice/contracts";
import { api, type Offsets } from "./api";
import { AppointmentForm, PatientForm, SignInForm } from "./forms";
import styles from "./workspace.module.css";

const FIRST_PAGE: Offsets = { patientOffset: 0, appointmentOffset: 0 };
const messageFor = (cause: unknown) =>
  cause instanceof Error
    ? cause.message
    : "The request could not be completed.";

function Results<T extends { id: string }>({
  title,
  empty,
  offset,
  page,
  pending,
  onPage,
  render,
}: {
  title: string;
  empty: string;
  offset: number;
  page: Page<T>;
  pending: boolean;
  onPage: (offset: number) => void;
  render: (item: T) => ReactNode;
}) {
  return (
    <Card padding="lg" className={styles.form}>
      <Heading level={3}>{title}</Heading>
      {page.items.length ? (
        <ul className={styles.list}>
          {page.items.map((item) => (
            <li key={item.id}>{render(item)}</li>
          ))}
        </ul>
      ) : (
        <Text tone="muted">{empty}</Text>
      )}
      {(offset > 0 || page.hasMore) && (
        <nav className={styles.toolbar} aria-label={`${title} pages`}>
          <Button
            size="sm"
            variant="secondary"
            disabled={!offset || pending}
            onClick={() => onPage(offset - WORKSPACE_PAGE_SIZE)}
          >
            Previous
          </Button>
          <Text variant="small">Page {offset / WORKSPACE_PAGE_SIZE + 1}</Text>
          <Button
            size="sm"
            variant="secondary"
            disabled={!page.hasMore || pending}
            onClick={() => onPage(offset + WORKSPACE_PAGE_SIZE)}
          >
            Next
          </Button>
        </nav>
      )}
    </Card>
  );
}

export function Workspace() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [offsets, setOffsets] = useState(FIRST_PAGE);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void api
      .load(FIRST_PAGE, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setSnapshot(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(messageFor(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });
    return () => controller.abort();
  }, []);

  async function load(next: Offsets) {
    const result = await api.load(next);
    setSnapshot(result);
    setOffsets(next);
  }

  function run(work: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setError("");
    setPending(true);
    void work()
      .catch((cause: unknown) => setError(messageFor(cause)))
      .finally(() => {
        busy.current = false;
        setPending(false);
      });
  }

  const submit = (work: () => Promise<void>) =>
    run(async () => {
      await work();
      await load(offsets);
    });

  return (
    <>
      {error && <Alert tone="danger">{error}</Alert>}
      {!ready ? (
        <Text>Loading workspace…</Text>
      ) : !snapshot ? (
        <SignInForm submit={submit} pending={pending} />
      ) : (
        <>
          <div className={styles.toolbar}>
            <div>
              <Heading level={2}>{snapshot.member.clinic}</Heading>
              <Text tone="muted">{snapshot.member.name}</Text>
            </div>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  await api.signOut();
                  setSnapshot(null);
                  setOffsets(FIRST_PAGE);
                })
              }
            >
              Sign Out
            </Button>
          </div>
          <div className={styles.grid}>
            <PatientForm submit={submit} pending={pending} />
            <AppointmentForm
              key={offsets.patientOffset}
              submit={submit}
              pending={pending}
              patients={snapshot.patients.items}
              paged={offsets.patientOffset > 0 || snapshot.patients.hasMore}
            />
            <Results
              title="Patients"
              empty="No patients registered."
              page={snapshot.patients}
              offset={offsets.patientOffset}
              pending={pending}
              onPage={(patientOffset) =>
                run(() => load({ ...offsets, patientOffset }))
              }
              render={({ name, owner, species }) => (
                <>
                  <Text variant="label" tone="heading">
                    {name}
                  </Text>
                  <Text variant="supporting" tone="muted">
                    {species} · {owner}
                  </Text>
                </>
              )}
            />
            <Results
              title="Upcoming Appointments"
              empty="No upcoming appointments."
              page={snapshot.appointments}
              offset={offsets.appointmentOffset}
              pending={pending}
              onPage={(appointmentOffset) =>
                run(() => load({ ...offsets, appointmentOffset }))
              }
              render={({ patient, reason, startsAt }) => (
                <>
                  <Text variant="label" tone="heading">
                    {patient} · {reason}
                  </Text>
                  <time dateTime={startsAt}>
                    {new Date(startsAt).toLocaleString()}
                  </time>
                </>
              )}
            />
          </div>
        </>
      )}
    </>
  );
}
