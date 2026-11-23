import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { Pagination } from "@/app/shared/ui/Pagination";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import {
  REGISTRY_PAGE_SIZE,
  type RegistryPage,
  type RegistryQuery,
  registryHref,
} from "../_lib/registry";
import styles from "../registry.module.css";
import { ClinicalAction } from "./ClinicalAction";
import { RegistryFilters } from "./RegistryFilters";
import { OwnersTable, PatientsTable } from "./RegistryTables";

export function PatientRegistry({
  filters,
  registry,
}: {
  filters: RegistryQuery;
  registry: RegistryPage;
}) {
  const { counts, total, page, entries, patients, owners } = registry;
  const showOwners = filters.tab === "owners";
  const pageCount = Math.ceil(total / REGISTRY_PAGE_SIZE);
  const count = showOwners ? owners.length : patients.length;
  const offset = (page - 1) * REGISTRY_PAGE_SIZE;
  const entity = showOwners ? "pet owners" : "registered pet patients";

  return (
    <>
      <SectionHeader
        as="h1"
        title="Patients & Pet Owners Registry"
        description="Search patient records, review clinical histories, and manage owner contact and microchip details."
        actions={
          <div className={styles.actions}>
            <ButtonLink
              variant="secondary"
              href={ROUTES.clinicalRegistryExport}
              download
              prefetch={false}
            >
              Export Client Directory (CSV)
            </ButtonLink>
            <ClinicalAction
              kind="intake"
              label="+ Register New Patient"
              variant="primary"
            />
          </div>
        }
      />
      <RegistryFilters filters={filters} counts={counts} />
      <div className={styles.panel}>
        {showOwners ? (
          <OwnersTable owners={owners} />
        ) : (
          <PatientsTable patients={patients} entries={entries} />
        )}
        <footer className={styles.footer}>
          <span>
            {count > 0
              ? `Showing ${offset + 1} to ${offset + count} of ${total} ${entity}`
              : `Showing 0 ${entity}`}
          </span>
          {pageCount > 1 && (
            <Pagination
              page={page}
              pageCount={pageCount}
              previousLabel="Previous"
              aria-label="Registry pages"
              getPageHref={(nextPage) =>
                registryHref({ ...filters, page: nextPage })
              }
            />
          )}
        </footer>
      </div>
    </>
  );
}
