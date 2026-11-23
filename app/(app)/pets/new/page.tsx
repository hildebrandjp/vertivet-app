import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/app/shared/ui/Card";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { verifySession } from "../../_lib/data/dal";
import styles from "../pets.module.css";
import { PetForm } from "./PetForm";

export const metadata: Metadata = { title: "Add New Pet · VertiVet" };

async function AuthorizedPetForm() {
  await verifySession();
  return <PetForm />;
}

export default function NewPetPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        as="h1"
        title="Add New Pet"
        description="Create a profile to book visits and keep track of your pet’s care."
      />
      <Card className={styles.formCard} padding="lg">
        <Suspense fallback={<output>Loading pet form…</output>}>
          <AuthorizedPetForm />
        </Suspense>
      </Card>
    </div>
  );
}
