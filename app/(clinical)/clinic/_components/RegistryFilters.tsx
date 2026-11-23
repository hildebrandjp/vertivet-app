import { ROUTES } from "@/app/shared/config/routes";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import controlStyles from "@/app/shared/ui/Control.module.css";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import { SearchIcon } from "@/app/shared/ui/icons";
import { TextInput } from "@/app/shared/ui/TextInput";
import { cx } from "@/app/shared/utils/cx";
import { SPECIES } from "../_lib/model";
import {
  type RegistryPage,
  type RegistryQuery,
  registryHref,
  SPECIES_LABELS,
} from "../_lib/registry";
import styles from "../registry.module.css";

const TABS = [
  ["all", "All Patients"],
  ["owners", "Pet Owners"],
  ["due", "Vaccinations Due"],
] as const;

export function RegistryFilters({
  filters,
  counts,
}: {
  filters: RegistryQuery;
  counts: RegistryPage["counts"];
}) {
  return (
    <div className={styles.toolbar}>
      <nav className={styles.tabs} aria-label="Registry views">
        {TABS.map(([tab, label]) => (
          <ButtonLink
            key={tab}
            href={registryHref({ ...filters, tab, page: 1 })}
            variant="secondary"
            size="sm"
            aria-current={filters.tab === tab ? "page" : undefined}
            className={styles.tab}
            scroll={false}
          >
            {label} ({counts[tab]})
          </ButtonLink>
        ))}
      </nav>
      <search aria-label="Registry filters">
        <form
          action={ROUTES.clinicalDashboard}
          className={styles.filters}
          key={JSON.stringify([filters.query, filters.species, filters.tab])}
        >
          <input
            type="hidden"
            name="view"
            value={filters.tab === "owners" ? "owners" : "patients"}
          />
          {filters.tab === "due" && (
            <input type="hidden" name="tab" value="due" />
          )}
          <InputGroup startAddon={<SearchIcon />} size="sm">
            <TextInput
              id="registry-search"
              type="search"
              name="q"
              maxLength={100}
              defaultValue={filters.query}
              placeholder="Search pet name, chip #, or owner…"
              aria-label="Search registry by pet name, chip number, or owner"
            />
          </InputGroup>
          <select
            name="species"
            aria-label="Species"
            defaultValue={filters.species ?? ""}
            data-size="sm"
            className={cx(controlStyles.control, styles.species)}
          >
            <option value="">All Species</option>
            {SPECIES.map((species) => (
              <option key={species} value={species}>
                {SPECIES_LABELS[species]}
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
