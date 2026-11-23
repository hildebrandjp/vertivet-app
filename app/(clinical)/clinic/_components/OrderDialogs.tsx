"use client";

import { type ReactNode, useActionState, useId, useState } from "react";
import { formatAppointmentDate } from "@/app/(app)/_lib/format";
import { Alert } from "@/app/shared/ui/Alert";
import { Button } from "@/app/shared/ui/Button";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Field } from "@/app/shared/ui/Field";
import { TextArea } from "@/app/shared/ui/TextArea";
import { TextInput } from "@/app/shared/ui/TextInput";
import { TextLink } from "@/app/shared/ui/TextLink";
import { Text } from "@/app/shared/ui/Typography";
import {
  type ClinicalOrder,
  canAuthorizeRefill,
  canReleaseResult,
  type OrderCommand,
  type OrderPatient,
  scanLink,
} from "../_lib/diagnostics";
import type { ClinicalResult } from "../actions";
import styles from "../clinic.module.css";
import { saveOrder } from "../diagnostics-actions";

const INITIAL: ClinicalResult = { status: "idle" };

function MutationDialog({
  title,
  description,
  kind,
  id,
  submit,
  children,
  close,
}: {
  title: string;
  description?: string;
  kind: OrderCommand["kind"];
  id?: string;
  submit: string;
  children: ReactNode;
  close: () => void;
}) {
  const formId = useId();
  const [state, action, pending] = useActionState(
    saveOrder.bind(null, kind, id ?? ""),
    INITIAL,
  );
  const saved = state.status === "saved";
  return (
    <Dialog
      open
      title={title}
      description={description}
      dismissible={!pending}
      onOpenChange={(open) => {
        if (!open && !pending) close();
      }}
      footer={
        saved ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" disabled={pending} onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={pending}>
              {submit}
            </Button>
          </>
        )
      }
    >
      {saved ? (
        <Alert tone="success">Change saved.</Alert>
      ) : (
        <form id={formId} action={action} className={styles.commandForm}>
          {state.status === "error" && (
            <Alert tone="danger">{state.message}</Alert>
          )}
          {children}
        </form>
      )}
    </Dialog>
  );
}

export function CreateOrder({
  kind,
  patients,
}: {
  kind: "lab" | "prescription";
  patients: OrderPatient[];
}) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({ patientId: "", title: "", notes: "" });
  const patientInput = useId();
  const rx = kind === "prescription";
  const title = rx ? "Write Digital Prescription" : "Order Lab Diagnostics";
  function close() {
    setOpen(false);
    setFields({ patientId: "", title: "", notes: "" });
  }
  const setField = (key: keyof typeof fields, value: string) =>
    setFields((current) => ({ ...current, [key]: value }));
  return (
    <>
      <Button
        variant={rx ? "primary" : "secondary"}
        disabled={!patients.length}
        onClick={() => setOpen(true)}
      >
        + {title}
      </Button>
      {open && (
        <MutationDialog
          title={title}
          kind="create_order"
          submit={rx ? "Save Prescription Draft" : "Place Lab Order"}
          close={close}
          description={rx ? "Save a draft for clinical review." : undefined}
        >
          <input type="hidden" name="orderKind" value={kind} />
          <Field label="Patient" id={patientInput} required>
            <select
              id={patientInput}
              required
              name="patientId"
              value={fields.patientId}
              onChange={(event) => setField("patientId", event.target.value)}
              data-size="md"
              className={controlStyles.control}
            >
              <option value="">Choose a patient</option>
              {patients.map(({ id, name, owner }) => (
                <option key={id} value={id}>
                  {name} · {owner}
                </option>
              ))}
            </select>
          </Field>
          <Field label={rx ? "Medication Name" : "Diagnostic Test"} required>
            <TextInput
              name="title"
              maxLength={160}
              value={fields.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label={rx ? "Prescription Instructions" : "Clinical Notes"}>
            <TextArea
              name="notes"
              rows={4}
              maxLength={1000}
              value={fields.notes}
              onChange={(event) => setField("notes", event.target.value)}
            />
          </Field>
        </MutationDialog>
      )}
    </>
  );
}

function OrderDetails({
  order,
  refills,
}: {
  order: ClinicalOrder;
  refills: boolean;
}) {
  const scan = scanLink(order.scanUrl);
  return (
    <div className={styles.commandForm}>
      <DescriptionList
        items={[
          {
            term: "Patient",
            details: `${order.patient.name} · ${order.patient.owner}`,
          },
          { term: "Order Reference", details: order.reference ?? order.id },
          ...(order.notes ? [{ term: "Notes", details: order.notes }] : []),
          ...(order.result ? [{ term: "Result", details: order.result }] : []),
        ]}
      />
      {scan && (
        <TextLink href={scan} rel="noopener noreferrer" target="_blank">
          Open Scan
        </TextLink>
      )}
      {refills && (
        <>
          <Text variant="label">
            Refills remaining: {order.refillsRemaining ?? "Not recorded"}
          </Text>
          {order.refillLog?.length ? (
            <ul className={styles.plainList}>
              {order.refillLog.map((entry) => (
                <li key={entry.id}>
                  {Number.isFinite(Date.parse(entry.authorizedAt))
                    ? formatAppointmentDate(entry.authorizedAt)
                    : "Date unavailable"}{" "}
                  · {entry.clinician}
                </li>
              ))}
            </ul>
          ) : (
            <Text variant="supporting" tone="muted">
              No refill authorizations recorded.
            </Text>
          )}
        </>
      )}
    </div>
  );
}

export function OrderReview({
  order,
  canManage,
}: {
  order: ClinicalOrder;
  canManage: boolean;
}) {
  const [view, setView] = useState<"details" | "release" | "refill" | null>(
    null,
  );
  const rx = order.kind === "prescription";
  const reviewable = canManage && canReleaseResult(order);
  const refillable = canManage && canAuthorizeRefill(order);
  const showRefills = rx && order.status !== "draft";
  const label = reviewable
    ? "Sign & Release"
    : showRefills
      ? "Refill Log"
      : order.kind === "imaging" && scanLink(order.scanUrl)
        ? "View Scans"
        : "View Order";
  return (
    <>
      <Button
        size="sm"
        variant={reviewable ? "primary" : "secondary"}
        aria-label={`${label} for ${order.patient.name}`}
        onClick={() => setView(reviewable ? "release" : "details")}
      >
        {label}
      </Button>
      {view === "details" && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setView(null);
          }}
          title={order.title}
          size="md"
          showCloseButton
          footer={
            refillable ? (
              <Button onClick={() => setView("refill")}>
                Authorize Refill
              </Button>
            ) : undefined
          }
        >
          <OrderDetails order={order} refills={showRefills} />
        </Dialog>
      )}
      {view === "release" && (
        <MutationDialog
          title="Sign & Release Result"
          description={order.title}
          kind="release_result"
          id={order.id}
          submit="Sign & Release"
          close={() => setView(null)}
        >
          <OrderDetails order={order} refills={false} />
          <Text variant="supporting">
            Confirm you have reviewed the report and are ready to release it.
          </Text>
        </MutationDialog>
      )}
      {view === "refill" && (
        <MutationDialog
          title="Authorize Prescription Refill"
          description={order.title}
          kind="authorize_refill"
          id={order.id}
          submit="Authorize Refill"
          close={() => setView(null)}
        >
          <OrderDetails order={order} refills />
          <Text variant="supporting">
            This authorizes one refill and records the action in the refill log.
          </Text>
        </MutationDialog>
      )}
    </>
  );
}
