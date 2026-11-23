import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TextLink } from "@/app/shared/ui/TextLink";
import { getPets } from "../../_lib/data/dal";
import { ClinicalRecords } from "../_components/ClinicalRecords";
import { PetProfileCard } from "../_components/PetProfileCard";
import styles from "../pets.module.css";

export const metadata: Metadata = { title: "Pet Profile · VertiVet" };

async function PetProfile({ params }: Pick<PageProps<"/pets/[id]">, "params">) {
  const [{ id }, pets] = await Promise.all([params, getPets()]);
  const pet = pets.find((item) => item.id === id);
  if (!pet) notFound();

  return (
    <>
      <SectionHeader
        as="h1"
        title="Pet Profile"
        actions={<TextLink href={ROUTES.pets}>Back to My Pets</TextLink>}
      />
      <PetProfileCard pet={pet} today={new Date()} />
      <ClinicalRecords pets={[pet]} />
    </>
  );
}

export default function PetProfilePage({ params }: PageProps<"/pets/[id]">) {
  return (
    <div className={styles.page}>
      <Suspense fallback={<output>Loading pet profile…</output>}>
        <PetProfile params={params} />
      </Suspense>
    </div>
  );
}
