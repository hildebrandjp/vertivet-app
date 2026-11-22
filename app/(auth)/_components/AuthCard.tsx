import type { ComponentPropsWithRef, ReactNode } from "react";
import type { FormMessage } from "@/app/shared/forms/form-state";
import { Alert } from "@/app/shared/ui/Alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/Card";
import { cx } from "@/app/shared/utils/cx";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  /** Card heading ("Sign In"). Omit for result panels. */
  title?: ReactNode;
  description?: ReactNode;
  /** Form-level error shown as a banner above the card. */
  error?: FormMessage | null;
  onDismissError?: () => void;
  children: ReactNode;
}

/** Banner + white card shell shared by every auth form. */
export function AuthCard({
  title,
  description,
  error,
  onDismissError,
  children,
}: AuthCardProps) {
  return (
    <div className={styles.stack}>
      {error ? (
        <Alert tone="danger" title={error.title} onDismiss={onDismissError}>
          {error.message}
        </Alert>
      ) : null}
      <Card padding="lg" className={styles.card}>
        {title ? (
          <CardHeader divider>
            <CardTitle level={3} as="h2">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </CardHeader>
        ) : null}
        {children}
      </Card>
    </div>
  );
}

/** Vertical form layout. `noValidate`: shared validators own the messages. */
export function AuthForm({
  className,
  ...rest
}: ComponentPropsWithRef<"form">) {
  return <form noValidate {...rest} className={cx(styles.form, className)} />;
}

/** Puts short fields side by side, stacking on narrow screens. */
export function AuthFormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
