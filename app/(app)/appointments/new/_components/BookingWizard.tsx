"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Alert } from "@/app/shared/ui/Alert";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/app/shared/ui/icons";
import { Stepper } from "@/app/shared/ui/Stepper";
import { CLINIC_CONTACT } from "../../../_lib/content";
import type { Pet, ServiceOffering, TimeSlot } from "../../../_lib/data/types";
import {
  applyDraftChange,
  BOOKING_STEPS,
  type BookingDraft,
  EMPTY_DRAFT,
  highestReachableStep,
  missingForStep,
  STEP_COPY,
  stepIndexOf,
} from "../_lib/booking";
import { BookingTips } from "./BookingTips";
import styles from "./booking.module.css";
import { DetailsStep } from "./DetailsStep";
import { ReviewStep } from "./ReviewStep";
import { ScheduleStep } from "./ScheduleStep";
import { WizardFooter } from "./WizardFooter";

interface BookingWizardProps {
  pets: Pet[];
  services: ServiceOffering[];
}

/**
 * Three-step booking flow. The step lives in the URL (?step=schedule) via
 * shallow history updates: Back/Forward work, and no server round trip is
 * made between steps. Choices live in one draft object.
 */
export function BookingWizard({ pets, services }: BookingWizardProps) {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [blocker, setBlocker] = useState<string | null>(null);
  // Slots per "service|date", kept while the wizard is open.
  const slotCache = useRef(new Map<string, TimeSlot[]>());

  const requested = stepIndexOf(searchParams.get("step"));
  const step = Math.min(requested, highestReachableStep(draft));
  const stepId = BOOKING_STEPS[step].id;
  const copy = STEP_COPY[stepId];

  // Move focus to the new step's heading (not on first load).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goTo = useCallback((index: number) => {
    setBlocker(null);
    const url = new URL(window.location.href);
    if (index === 0) url.searchParams.delete("step");
    else url.searchParams.set("step", BOOKING_STEPS[index].id);
    window.history.pushState(null, "", url);
  }, []);

  const update = useCallback((patch: Partial<BookingDraft>) => {
    setBlocker(null);
    setDraft((current) => applyDraftChange(current, patch));
  }, []);

  const next = () => {
    const missing = missingForStep(step, draft);
    if (missing) setBlocker(missing);
    else goTo(step + 1);
  };

  const pet = pets.find((p) => p.id === draft.petId) ?? null;
  const service = services.find((s) => s.id === draft.serviceId) ?? null;

  return (
    <div className={styles.wizard}>
      <Stepper
        steps={BOOKING_STEPS}
        current={step}
        onStepSelect={goTo}
        completedDisplay="number"
        aria-label="Booking progress"
      />

      <header className={styles.intro}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          {copy.title}
        </h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      {stepId === "details" ? (
        <DetailsStep
          pets={pets}
          services={services}
          draft={draft}
          onChange={update}
        />
      ) : null}

      {stepId === "schedule" && service ? (
        <ScheduleStep
          service={service}
          draft={draft}
          onChange={update}
          onContinue={() => goTo(2)}
          slotCache={slotCache.current}
        />
      ) : null}

      {stepId === "review" && pet && service ? (
        <ReviewStep
          pet={pet}
          service={service}
          draft={draft}
          onEdit={goTo}
          onNotesChange={(notes) => update({ notes })}
          onBookAnother={() => {
            setDraft(EMPTY_DRAFT);
            goTo(0);
          }}
        />
      ) : (
        <WizardFooter
          error={blocker}
          start={
            step === 0 ? (
              <ButtonLink href={ROUTES.dashboard} variant="secondary">
                Cancel Booking
              </ButtonLink>
            ) : (
              <Button
                variant="secondary"
                startIcon={<ChevronLeftIcon />}
                onClick={() => goTo(step - 1)}
              >
                Back
              </Button>
            )
          }
          end={
            <Button size="lg" endIcon={<ChevronRightIcon />} onClick={next}>
              {step === 0 ? "Continue to Schedule" : "Continue to Review"}
            </Button>
          }
        />
      )}

      {stepId === "details" ? (
        <Alert variant="callout" tone="info" title="Need help choosing?">
          If you&apos;re unsure which service is right for your pet, select
          &quot;Consultation&quot; or contact our front desk at{" "}
          <a
            href={`tel:${CLINIC_CONTACT.phoneHref}`}
            className={styles.inlineLink}
          >
            {CLINIC_CONTACT.phone}
          </a>{" "}
          for guidance.
        </Alert>
      ) : null}

      {stepId === "schedule" ? <BookingTips /> : null}
    </div>
  );
}
