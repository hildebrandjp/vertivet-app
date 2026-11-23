"use client";

import { useActionState, useId, useState } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Button, IconButton } from "@/app/shared/ui/Button";
import { Dialog } from "@/app/shared/ui/Dialog";
import { MoreHorizontalIcon } from "@/app/shared/ui/icons";
import type { AppointmentChange } from "../../_lib/data/types";
import { updateVisit, type VisitActionState } from "../actions";
import styles from "../appointments.module.css";
import { RescheduleFields } from "./RescheduleFields";

type ActionKind = AppointmentChange["kind"];
type View = ActionKind | "details";

const COPY = {
  confirm: {
    title: "Confirm Appointment",
    submit: "Confirm",
    label: "Confirm",
    success: "Your appointment is confirmed.",
  },
  cancel: {
    title: "Cancel Appointment",
    submit: "Cancel Appointment",
    label: "Cancel",
    success: "Your appointment is cancelled.",
  },
  reschedule: {
    title: "Reschedule Appointment",
    submit: "Save New Time",
    label: "Reschedule",
    success: "Your appointment was rescheduled.",
  },
};

interface VisitActionsProps {
  id: string;
  startsAt: string;
  summary: string;
  description: string;
  serviceId?: string;
  today: string;
  primary?: "confirm" | "reschedule";
  canCancel: boolean;
}

const INITIAL_STATE: VisitActionState = { status: "idle" };

function VisitChangeDialog({
  visit,
  kind,
  close,
}: {
  visit: VisitActionsProps;
  kind: ActionKind;
  close: () => void;
}) {
  const formId = useId();
  const copy = COPY[kind];
  const [state, action, pending] = useActionState(
    updateVisit.bind(null, visit.id, visit.startsAt, kind),
    INITIAL_STATE,
  );
  const [hasSlot, setHasSlot] = useState(false);
  const saved = state.status === "saved";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) close();
      }}
      dismissible={!pending}
      title={copy.title}
      description={visit.description}
      footer={
        saved ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" disabled={pending} onClick={close}>
              Go Back
            </Button>
            <Button
              type="submit"
              form={formId}
              variant={kind === "cancel" ? "danger" : "primary"}
              loading={pending}
              disabled={kind === "reschedule" && !hasSlot}
            >
              {copy.submit}
            </Button>
          </>
        )
      }
    >
      {saved ? (
        <Alert tone="success">{copy.success}</Alert>
      ) : (
        <form id={formId} action={action} className={styles.form}>
          {state.status === "error" && (
            <Alert tone="danger">{state.message}</Alert>
          )}
          {kind === "confirm" && <p>Confirm that you’ll attend this visit.</p>}
          {kind === "cancel" && (
            <p>
              This releases your appointment time. You can book another visit
              when you’re ready.
            </p>
          )}
          {kind === "reschedule" && visit.serviceId && (
            <RescheduleFields
              serviceId={visit.serviceId}
              today={visit.today}
              disabled={pending}
              onReadyChange={setHasSlot}
            />
          )}
        </form>
      )}
    </Dialog>
  );
}

export function VisitActions(visit: VisitActionsProps) {
  const [view, setView] = useState<View | null>(null);
  const close = () => setView(null);
  return (
    <div className={styles.actions}>
      {visit.primary && (
        <Button
          size="sm"
          variant={visit.primary === "confirm" ? "primary" : "secondary"}
          aria-label={`${COPY[visit.primary].label} ${visit.summary}`}
          onClick={() => setView(visit.primary ?? null)}
        >
          {COPY[visit.primary].label}
        </Button>
      )}
      <IconButton
        label={`Details for ${visit.summary}`}
        icon={<MoreHorizontalIcon />}
        size="sm"
        onClick={() => setView("details")}
      />
      {view === "details" && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) close();
          }}
          title="Appointment Details"
          description={visit.description}
          showCloseButton
          footer={
            visit.canCancel ? (
              <Button variant="danger" onClick={() => setView("cancel")}>
                Cancel Appointment
              </Button>
            ) : (
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
            )
          }
        >
          <p>{visit.summary}</p>
        </Dialog>
      )}
      {view && view !== "details" && (
        <VisitChangeDialog key={view} visit={visit} kind={view} close={close} />
      )}
    </div>
  );
}
