import type { Metadata } from "next";
import { Suspense } from "react";
import { ROUTES, routeTo } from "@/app/shared/config/routes";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TextLink } from "@/app/shared/ui/TextLink";
import { getPets } from "../_lib/data/dal";
import { ClinicalRecords } from "../pets/_components/ClinicalRecords";
import styles from "../pets/pets.module.css";

export const metadata: Metadata = { title: "Medical Records · VertiVet" };

type RecordsProps = Pick<PageProps<"/medical-records">, "searchParams">;

async function Records({ searchParams }: RecordsProps) {
  const [pets, query] = await Promise.all([getPets(), searchParams]);
  const petId = typeof query.petId === "string" ? query.petId : undefined;
  const recordId =
    typeof query.recordId === "string" ? query.recordId : undefined;
  const selectedPets = petId ? pets.filter((pet) => pet.id === petId) : pets;
  const pet = petId ? selectedPets[0] : undefined;
  const backHref = pet && recordId ? routeTo.petRecords(pet.id) : ROUTES.pets;

  return (
    <>
      <SectionHeader
        as="h1"
        title={pet ? `Medical Records for ${pet.name}` : "Medical Records"}
        actions={
          <TextLink href={backHref} className={styles.noPrint}>
            {pet && recordId
              ? `All Records for ${pet.name}`
              : "Back to My Pets"}
          </TextLink>
        }
      />
      <ClinicalRecords pets={selectedPets} recordId={recordId} full />
    </>
  );
}

export default function MedicalRecordsPage({
  searchParams,
}: PageProps<"/medical-records">) {
  return (
    <div className={styles.page} data-print-records>
      <Suspense fallback={<output>Loading medical records…</output>}>
        <Records searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
