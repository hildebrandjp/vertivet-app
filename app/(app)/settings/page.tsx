import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { getOwnerSettings } from "../_lib/data/dal";
import { SettingsWorkspace } from "./_components/SettingsWorkspace";
import styles from "./settings.module.css";

export const metadata: Metadata = {
  title: "Clinic & Account Settings · VertiVet",
};

async function SettingsLoader() {
  const { settings, demo } = await getOwnerSettings();
  return <SettingsWorkspace initial={settings} demo={demo} />;
}

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        as="h1"
        title="Clinic & Account Settings"
        description="Configure personal details, emergency preferences, and clinic communication."
      />
      <Suspense
        fallback={
          <div aria-busy="true">
            <span className="sr-only">Loading settings…</span>
            <Skeleton shape="rect" height="28rem" />
          </div>
        }
      >
        <SettingsLoader />
      </Suspense>
    </div>
  );
}
