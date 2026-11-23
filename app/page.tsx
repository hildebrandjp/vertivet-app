import styles from "./practice/workspace.module.css";
import { ROUTES } from "./shared/config/routes";
import { ButtonLink } from "./shared/ui/Button";
import { Logo } from "./shared/ui/Logo";
import { SectionHeader } from "./shared/ui/SectionHeader";

export default function Home() {
  return (
    <main className={styles.page}>
      <Logo size="sm" />
      <SectionHeader
        title="VertiVet"
        as="h1"
        description="Choose a workspace to continue."
      />
      <div className={styles.toolbar}>
        <ButtonLink href={ROUTES.practice}>Practice Workspace</ButtonLink>
        <ButtonLink href={ROUTES.login} variant="secondary">
          Pet Owner Sign-In
        </ButtonLink>
        <ButtonLink href={ROUTES.clinicalLogin} variant="secondary">
          Clinical Portal Sign-In
        </ButtonLink>
      </div>
    </main>
  );
}
