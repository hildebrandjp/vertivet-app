import { ROUTES } from "@/app/shared/config/routes";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import { SearchIcon } from "@/app/shared/ui/icons";
import { TextInput } from "@/app/shared/ui/TextInput";
import { cx } from "@/app/shared/utils/cx";
import type { Pet } from "../../_lib/data/types";
import {
  type readVisitQuery,
  VISIT_FILTERS,
  type VisitFilter,
  visitListHref,
} from "../_lib/visits";
import styles from "../appointments.module.css";

export function VisitFilters({
  pets,
  query,
  counts,
}: {
  pets: Pet[];
  query: ReturnType<typeof readVisitQuery>;
  counts: Record<VisitFilter, number>;
}) {
  return (
    <div className={styles.toolbar}>
      <nav className={styles.filters} aria-label="Visit status">
        {VISIT_FILTERS.map(({ id, label }) => (
          <ButtonLink
            key={id}
            href={visitListHref({ ...query, filter: id, page: 1 })}
            aria-current={query.filter === id ? "page" : undefined}
            className={styles.filter}
            variant="secondary"
            size="sm"
            scroll={false}
          >
            {label} ({counts[id]})
          </ButtonLink>
        ))}
      </nav>
      <search aria-label="Filter visits">
        <form
          key={JSON.stringify([query.query, query.petId])}
          action={ROUTES.appointments}
          className={styles.searchForm}
        >
          {query.filter !== "all" && (
            <input type="hidden" name="view" value={query.filter} />
          )}
          <InputGroup size="sm" startAddon={<SearchIcon />}>
            <TextInput
              name="q"
              type="search"
              aria-label="Search visits or practitioners"
              placeholder="Search visit or doctor…"
              defaultValue={query.query}
              maxLength={100}
            />
          </InputGroup>
          <select
            name="pet"
            aria-label="Filter by pet"
            defaultValue={query.petId}
            className={cx(controlStyles.control, styles.petSelect)}
            data-size="sm"
          >
            <option value="">All Pets</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="secondary">
            Apply
          </Button>
        </form>
      </search>
    </div>
  );
}
