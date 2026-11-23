import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/app/shared/config/routes";
import { Logo } from "@/app/shared/ui/Logo";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Workspace } from "./workspace";
import styles from "./workspace.module.css";

export const metadata: Metadata = { title: "Practice Workspace · VertiVet" };

export default function PracticePage() {
  return (
    <main className={styles.page}>
      <Link href={ROUTES.home} aria-label="VertiVet home">
        <Logo size="sm" />
      </Link>
      <SectionHeader
        title="Practice Workspace"
        as="h1"
        description="Manage clinic patients and appointments."
      />
      <Workspace />
    </main>
  );
}
