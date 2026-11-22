"use client";

import { type ReactNode, useId } from "react";
import { useModalDialog } from "../hooks/useModalDialog";
import { cx } from "../utils/cx";
import { Button, type ButtonVariant, IconButton } from "./Button";
import styles from "./Dialog.module.css";
import { CloseIcon } from "./icons";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Action buttons; laid out in equal-width columns. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  placement?: "center" | "right";
  closeOnBackdropClick?: boolean;
  /** When false, Escape and backdrop clicks don't close the dialog. */
  dismissible?: boolean;
  /** Show an × in the header. */
  showCloseButton?: boolean;
  /** Content at the end of the header row, e.g. a status badge. */
  headerAside?: ReactNode;
  className?: string;
}

/**
 * Modal confirmation / content dialog (12 Dialog), built on native <dialog>:
 * focus trap, Escape, top layer and focus restore come from the browser.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "sm",
  placement = "center",
  closeOnBackdropClick = true,
  dismissible = true,
  showCloseButton = false,
  headerAside,
  className,
}: DialogProps) {
  const ref = useModalDialog({
    open,
    onOpenChange,
    closeOnBackdropClick,
    dismissible,
    exitDuration: placement === "right" ? 280 : 0,
  });
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-size={size}
      data-placement={placement}
      className={cx(styles.dialog, className)}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {headerAside}
          {showCloseButton ? (
            <IconButton
              size="sm"
              label="Close"
              icon={<CloseIcon />}
              onClick={() => {
                if (placement === "right") {
                  ref.current?.dispatchEvent(
                    new Event("cancel", { cancelable: true }),
                  );
                } else onOpenChange(false);
              }}
            />
          ) : null}
        </header>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {children ? <div className={styles.body}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </dialog>
  );
}

export interface ConfirmDialogProps
  extends Omit<DialogProps, "footer" | "children"> {
  onConfirm: () => void;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  confirmVariant?: ButtonVariant;
  /** Shows a spinner on the confirm button and blocks closing. */
  loading?: boolean;
  children?: ReactNode;
}

/** Dialog preset with Cancel / Confirm actions. */
export function ConfirmDialog({
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  loading = false,
  onOpenChange,
  ...rest
}: ConfirmDialogProps) {
  return (
    <Dialog
      {...rest}
      onOpenChange={onOpenChange}
      dismissible={!loading}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            loading={loading}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
