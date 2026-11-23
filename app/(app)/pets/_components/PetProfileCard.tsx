import { routeTo } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { ButtonLink } from "@/app/shared/ui/Button";
import { Card, CardTitle } from "@/app/shared/ui/Card";
import { Text } from "@/app/shared/ui/Typography";
import type { Pet } from "../../_lib/data/types";
import { describePet, formatDay } from "../../_lib/format";
import styles from "../pets.module.css";

const CARE_STATUS = {
  current: { label: "Current", tone: "primary" },
  due: { label: "Due", tone: "accent" },
  overdue: { label: "Overdue", tone: "danger" },
  scheduled: { label: "Scheduled", tone: "neutral" },
} as const;

export function PetProfileCard({ pet, today }: { pet: Pet; today: Date }) {
  const care = pet.preventiveCare ?? [];
  const needsAttention = care.some(
    ({ status }) => status === "due" || status === "overdue",
  );
  const sex =
    pet.sex === "female"
      ? pet.altered
        ? "Female · Spayed"
        : "Female"
      : pet.sex === "male"
        ? pet.altered
          ? "Male · Neutered"
          : "Male"
        : null;
  const description = [
    pet.breed,
    pet.weightKg == null ? null : `${pet.weightKg} kg`,
    sex,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card padding="lg" className={styles.profile}>
      <div className={styles.profileHeader}>
        <Avatar
          name={pet.name}
          src={pet.photoUrl}
          shape="rounded"
          size="xl"
          decorative
        />
        <div className={styles.profileIdentity}>
          <div className={styles.nameRow}>
            <CardTitle as="h2" level={2}>
              {pet.name}
            </CardTitle>
            <Badge variant="soft" size="sm" shape="pill">
              {describePet(pet, today)}
            </Badge>
          </div>
          <Text tone="muted" variant="supporting">
            {description}
          </Text>
        </div>
        {needsAttention && (
          <Badge variant="soft" tone="accent" size="sm" shape="pill" dot>
            Care due
          </Badge>
        )}
      </div>
      <div>
        <Text variant="eyebrow" tone="muted">
          Vaccinations &amp; preventive care
        </Text>
        {care.length ? (
          <ul className={styles.careList}>
            {care.map((item) => {
              const { label, tone } = CARE_STATUS[item.status];
              return (
                <li key={item.id}>
                  <Badge tone={tone} variant="soft" dot={tone !== "neutral"}>
                    {item.name} ({label}
                    {item.dueDate ? ` · ${formatDay(item.dueDate)}` : ""})
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <Text variant="supporting" tone="muted">
            No preventive care records available.
          </Text>
        )}
      </div>
      <div className={styles.profileActions}>
        <ButtonLink href={routeTo.bookPet(pet.id)} fullWidth>
          Book Visit for {pet.name}
        </ButtonLink>
        <ButtonLink
          href={routeTo.petRecords(pet.id)}
          variant="secondary"
          fullWidth
          aria-label={`Medical records for ${pet.name}`}
        >
          Medical Records
        </ButtonLink>
      </div>
    </Card>
  );
}
