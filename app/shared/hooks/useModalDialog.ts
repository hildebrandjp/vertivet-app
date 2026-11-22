"use client";

import { useEffect, useRef } from "react";

interface UseModalDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Close when the user clicks the backdrop. */
  closeOnBackdropClick?: boolean;
  /** When false, Escape and backdrop clicks are ignored (e.g. while saving). */
  dismissible?: boolean;
  /** Keep the modal mounted while its exit animation plays. */
  exitDuration?: number;
}

/**
 * Drives a native <dialog> as a modal: showModal()/close() follow `open`,
 * Escape and backdrop clicks report back through `onOpenChange`.
 * Focus trapping, top-layer stacking and focus restore come from the browser.
 */
export function useModalDialog({
  open,
  onOpenChange,
  closeOnBackdropClick = true,
  dismissible = true,
  exitDuration = 0,
}: UseModalDialogOptions) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestClose = () => {
    const dialog = ref.current;
    if (!dialog?.open || closeTimer.current !== null) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : exitDuration;
    if (!duration) {
      dialog.close();
      return;
    }
    dialog.dataset.closing = "true";
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      delete dialog.dataset.closing;
      dialog.close();
    }, duration);
  };
  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  });
  useEffect(
    () => () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    },
    [],
  );
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Sync the `open` prop to the element.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) requestCloseRef.current();
  }, [open]);

  // Report closes coming from the browser (Escape, form[method=dialog]).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClose = () => onOpenChangeRef.current(false);
    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (dismissible) requestCloseRef.current();
    };
    const handleClick = (event: MouseEvent) => {
      // A click whose target is the <dialog> itself landed on the backdrop,
      // because all content sits inside an inner wrapper.
      if (dismissible && closeOnBackdropClick && event.target === dialog) {
        requestCloseRef.current();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [closeOnBackdropClick, dismissible]);

  return ref;
}
