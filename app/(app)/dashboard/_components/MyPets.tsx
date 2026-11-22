import { routeTo } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { ListCard, ListCardGroup } from "@/app/shared/ui/ListCard";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { getPets } from "../../_lib/data/dal";
import { describePet } from "../../_lib/format";
import styles from "./DashboardPanels.module.css";

/** The user's pets as linked cards (streams in per user). */
export async function MyPetsList({ limit = 4 }: { limit?: number }) {
  const pets = await getPets();
  const today = new Date();

  if (pets.length === 0) {
    return <p className={styles.emptyText}>No pet profiles yet.</p>;
  }

  return (
    <ListCardGroup label="My pets">
      {pets.slice(0, limit).map((pet) => (
        <li key={pet.id}>
          <ListCard
            href={routeTo.pet(pet.id)}
            media={
              <Avatar
                name={pet.name}
                src={pet.photoUrl}
                shape="rounded"
                size="lg"
                decorative
              />
            }
            title={pet.name}
            description={describePet(pet, today, { detail: "breed" })}
          />
        </li>
      ))}
    </ListCardGroup>
  );
}

export function MyPetsListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className={styles.petSkeletons} aria-busy="true">
      <span className="sr-only">Loading pets…</span>
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows.
        <div key={index} className={styles.petSkeleton}>
          <Skeleton shape="rect" width="48px" height="48px" />
          <span className={styles.petSkeletonText}>
            <Skeleton width="40%" />
            <Skeleton width="70%" height="0.75em" />
          </span>
        </div>
      ))}
    </div>
  );
}
