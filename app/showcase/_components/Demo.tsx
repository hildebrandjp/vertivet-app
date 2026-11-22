import type { ReactNode } from "react";
import { Heading, Text } from "@/app/shared/ui/Typography";
import styles from "../showcase.module.css";

interface DemoProps {
  index: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** One numbered tile in the component showcase grid. */
export function Demo({ index, title, subtitle, children }: DemoProps) {
  return (
    <section className={styles.demo}>
      <header className={styles.demoHeader}>
        <Heading level={4} as="h3">
          {index} {title}
        </Heading>
        <Text variant="small">{subtitle}</Text>
      </header>
      <div className={styles.demoBody}>{children}</div>
    </section>
  );
}

interface ShowcaseGroupProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** A titled group of demos laid out in the responsive grid. */
export function ShowcaseGroup({
  title,
  description,
  children,
}: ShowcaseGroupProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Heading level={2}>{title}</Heading>
        <Text variant="supporting">{description}</Text>
      </div>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}
