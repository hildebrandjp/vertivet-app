import { cx } from "../utils/cx";
import { CheckIcon } from "./icons";
import styles from "./Stepper.module.css";

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: readonly StepperStep[];
  /** Index of the current step (0-based). */
  current: number;
  /** check = completed steps show a tick; number = keep their number. */
  completedDisplay?: "check" | "number";
  layout?: "inline" | "stacked";
  /** Hide labels visually while retaining accessible step names. */
  showLabels?: boolean;
  /** When set, completed steps become buttons that jump back. */
  onStepSelect?: (index: number) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * Numbered progress for multi-step flows: 1 Pet & Service — 2 Date & Time —
 * 3 Review. Completed steps show a check; the current one is highlighted.
 */
export function Stepper({
  steps,
  current,
  onStepSelect,
  completedDisplay = "check",
  layout = "inline",
  showLabels = true,
  "aria-label": ariaLabel = "Progress",
  className,
}: StepperProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cx(styles.stepper, className)}
      data-completed={completedDisplay}
      data-layout={layout}
      data-labels={showLabels ? "visible" : "hidden"}
    >
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const state =
            index < current
              ? "complete"
              : index === current
                ? "current"
                : "upcoming";
          const content = (
            <>
              <span className={styles.marker} aria-hidden="true">
                {state === "complete" && completedDisplay === "check" ? (
                  <CheckIcon strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span className={styles.label}>
                {step.label}
                {state === "complete" ? (
                  <span className="sr-only"> (completed)</span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={step.id} className={styles.step} data-state={state}>
              {state === "complete" && onStepSelect ? (
                <button
                  type="button"
                  className={styles.content}
                  onClick={() => onStepSelect(index)}
                >
                  {content}
                </button>
              ) : (
                <span
                  className={styles.content}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
