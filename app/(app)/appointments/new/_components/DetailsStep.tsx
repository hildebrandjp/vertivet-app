"use client";

import type { ComponentType } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { ButtonLink } from "@/app/shared/ui/Button";
import { ChoiceCard, ChoiceGroup } from "@/app/shared/ui/ChoiceCard";
import {
  CheckIcon,
  type IconProps,
  InfoIcon,
  PlusIcon,
  ScissorsIcon,
  StethoscopeIcon,
  SyringeIcon,
} from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import type {
  Pet,
  ServiceIcon,
  ServiceOffering,
} from "../../../_lib/data/types";
import { formatDuration, formatPrice } from "../../../_lib/format";
import type { BookingDraft } from "../_lib/booking";
import styles from "./booking.module.css";

const SERVICE_ICONS: Record<ServiceIcon, ComponentType<IconProps>> = {
  checkup: StethoscopeIcon,
  vaccination: SyringeIcon,
  grooming: ScissorsIcon,
  consultation: InfoIcon,
};

interface DetailsStepProps {
  pets: Pet[];
  services: ServiceOffering[];
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}

/** Step 1: which pet, and which service. */
export function DetailsStep({
  pets,
  services,
  draft,
  onChange,
}: DetailsStepProps) {
  return (
    <>
      <section className={styles.section} aria-labelledby="select-pet">
        <SectionHeader
          id="select-pet"
          title="Select Pet"
          actions={
            <ButtonLink
              href={ROUTES.newPet}
              variant="secondary"
              size="sm"
              startIcon={<PlusIcon />}
            >
              Add New Pet
            </ButtonLink>
          }
        />
        {pets.length === 0 ? (
          <p className={styles.muted}>
            Add a pet profile to book an appointment.
          </p>
        ) : (
          <ChoiceGroup labelledBy="select-pet" minItemWidth="280px">
            {pets.map((pet) => (
              <ChoiceCard
                key={pet.id}
                name="pet"
                value={pet.id}
                checked={draft.petId === pet.id}
                onSelect={(petId) => onChange({ petId })}
              >
                <span className={styles.petOption}>
                  <Avatar
                    name={pet.name}
                    src={pet.photoUrl}
                    size="xl"
                    decorative
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{pet.name}</span>
                    <span className={styles.optionMeta}>{pet.breed}</span>
                  </span>
                </span>
              </ChoiceCard>
            ))}
          </ChoiceGroup>
        )}
      </section>

      <section className={styles.section} aria-labelledby="choose-service">
        <SectionHeader
          id="choose-service"
          title="Choose Service"
          description="Prices may vary based on specific pet needs."
        />
        <ChoiceGroup labelledBy="choose-service" minItemWidth="360px">
          {services.map((service) => {
            const selected = draft.serviceId === service.id;
            const Icon = SERVICE_ICONS[service.icon] ?? StethoscopeIcon;
            return (
              <ChoiceCard
                key={service.id}
                name="service"
                value={service.id}
                checked={selected}
                indicator="none"
                onSelect={(serviceId) => onChange({ serviceId })}
              >
                <span className={styles.serviceTop}>
                  <span
                    className={styles.iconTile}
                    data-selected={selected || undefined}
                  >
                    <Icon />
                  </span>
                  <Badge size="sm" shape="pill" variant="soft" tone="neutral">
                    {formatDuration(service.durationMinutes)}
                  </Badge>
                </span>
                <span className={styles.serviceTitle}>{service.name}</span>
                <span className={styles.serviceDescription}>
                  {service.description}
                </span>
                <span className={styles.serviceBottom}>
                  <span className={styles.price}>
                    {formatPrice(service.priceCents)}
                  </span>
                  {selected ? (
                    <span className={styles.selectedTag}>
                      <CheckIcon /> Selected
                    </span>
                  ) : null}
                </span>
              </ChoiceCard>
            );
          })}
        </ChoiceGroup>
      </section>
    </>
  );
}
