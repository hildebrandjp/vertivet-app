import { ROUTES } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import {
  CalendarIcon,
  CheckCircleIcon,
  HeartIcon,
  SearchIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { Pagination } from "@/app/shared/ui/Pagination";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TableCell, TableRow } from "@/app/shared/ui/Table";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Text } from "@/app/shared/ui/Typography";
import type { PracticeOverview } from "../_lib/model";
import {
  REGISTRY_PAGE_SIZE,
  type RegistryOwner,
  type RegistryPage,
  type RegistryQuery,
  registryHref,
} from "../_lib/registry";
import styles from "../registry.module.css";
import { Email, Phone } from "./ClientContactLinks";
import { ClientProfile } from "./ClientProfile";
import { ClinicalAction } from "./ClinicalAction";
import { PracticeStats } from "./OverviewPanels";
import { RegistryTable } from "./RegistryTables";

const COLUMNS = [
  "Client & Pet Owner",
  "Contact & Address",
  "Registered Family Pets",
  "Account Status",
  "Actions",
];

function ClientTable({ owners }: { owners: RegistryOwner[] }) {
  return (
    <RegistryTable
      label="Clinical client directory"
      columns={COLUMNS}
      empty={owners.length === 0}
    >
      {owners.map((owner) => (
        <TableRow key={owner.id}>
          <TableCell>
            <div className={styles.identity}>
              <Avatar name={owner.name} decorative />
              <div>
                <Text variant="label" tone="heading">
                  {owner.name}
                </Text>
                {owner.memberId && (
                  <Text variant="small" tone="muted">
                    Member ID: #{owner.memberId}
                  </Text>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className={styles.clientContact}>
              <Phone value={owner.phone} />
              <Email value={owner.email} />
              {owner.address && <span>{owner.address}</span>}
              {!owner.phone && !owner.email && !owner.address && "Not recorded"}
            </div>
          </TableCell>
          <TableCell>
            <div className={styles.actions}>
              {owner.pets.length ? (
                owner.pets.map((pet, index) => (
                  // Names can repeat within a household. These labels are stateless.
                  // biome-ignore lint/suspicious/noArrayIndexKey: legacy API returns names without IDs.
                  <Badge key={index} variant="soft" shape="pill" size="sm">
                    {pet}
                  </Badge>
                ))
              ) : (
                <Text variant="small" tone="muted">
                  No pets registered
                </Text>
              )}
            </div>
          </TableCell>
          <TableCell>
            <Badge
              variant="soft"
              shape="pill"
              size="sm"
              dot
              tone={owner.status === "active" ? "success" : "neutral"}
            >
              {owner.status === "active"
                ? "Active Client"
                : owner.status === "inactive"
                  ? "Inactive Client"
                  : "Not recorded"}
            </Badge>
          </TableCell>
          <TableCell>
            <div className={styles.actions}>
              <ClientProfile owner={owner} />
              <ClinicalAction
                kind="client_update"
                id={owner.id}
                patient={owner.name}
                label="Edit Contact"
                size="sm"
                initialValues={{
                  name: owner.name,
                  email: owner.email ?? "",
                  phone: owner.phone ?? "",
                  address: owner.address ?? "",
                }}
              />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </RegistryTable>
  );
}

export function ClientDirectory({
  filters,
  registry,
  practiceCounts,
}: {
  filters: RegistryQuery;
  registry: RegistryPage;
  practiceCounts: PracticeOverview["counts"];
}) {
  const { page, total, owners, clientSummary, counts, recentCount } = registry;
  const offset = (page - 1) * REGISTRY_PAGE_SIZE;
  const pages = Math.ceil(total / REGISTRY_PAGE_SIZE);
  const registered = clientSummary?.registered ?? practiceCounts.owners;
  const associated = clientSummary?.associatedPets;
  const active = clientSummary?.active;
  const recent = clientSummary?.recent;
  const cards = [
    {
      label: "Registered Clients",
      value: `${registered} Owners`,
      icon: <StethoscopeIcon />,
    },
    {
      label: "Associated Pets",
      value: associated === undefined ? "Unavailable" : `${associated} Pets`,
      icon: <HeartIcon />,
      detail:
        registered && associated !== undefined
          ? `${(associated / registered).toFixed(1)} avg/owner`
          : undefined,
    },
    {
      label: "Recent Consultations",
      value: recent === undefined ? "Unavailable" : `${recent} Owners`,
      detail: "Last 30 days",
      icon: <CalendarIcon />,
    },
    {
      label: "Account Status",
      value: active === undefined ? "Unavailable" : `${active} Active`,
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <>
      <SectionHeader
        as="h1"
        title="Pet Owners & Client Directory"
        description="Manage client contacts, review recent consultations, and see registered family pets."
        actions={
          <div className={styles.actions}>
            <ButtonLink
              href={ROUTES.clinicalRegistryExport}
              variant="secondary"
              download
              prefetch={false}
            >
              Export Client Directory (CSV)
            </ButtonLink>
            <ClinicalAction
              kind="client_intake"
              label="+ New Client Intake"
              variant="primary"
            />
          </div>
        }
      />
      <PracticeStats cards={cards} />
      <div className={styles.toolbar}>
        <nav aria-label="Client directory views" className={styles.tabs}>
          <ButtonLink
            href={registryHref({ ...filters, recent: false, page: 1 })}
            variant="secondary"
            size="sm"
            className={styles.tab}
            aria-current={filters.recent ? undefined : "page"}
          >
            All Clients ({counts.owners})
          </ButtonLink>
          <ButtonLink
            href={registryHref({ ...filters, recent: true, page: 1 })}
            variant="secondary"
            size="sm"
            className={styles.tab}
            aria-current={filters.recent ? "page" : undefined}
          >
            Recent Consultations
            {recentCount === undefined ? "" : ` (${recentCount})`}
          </ButtonLink>
        </nav>
        <search aria-label="Client directory">
          <form
            action={ROUTES.clinicalDashboard}
            className={styles.filters}
            key={filters.query}
          >
            <input type="hidden" name="view" value="owners" />
            {filters.recent && <input type="hidden" name="recent" value="1" />}
            <InputGroup startAddon={<SearchIcon />} size="sm">
              <TextInput
                id="registry-search"
                type="search"
                name="q"
                maxLength={100}
                defaultValue={filters.query}
                placeholder="Search by name, phone, email, or pet…"
                aria-label="Search clients by name, phone, email, or pet"
              />
            </InputGroup>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>
        </search>
      </div>
      <div className={styles.panel}>
        <ClientTable owners={owners} />
        <footer className={styles.footer}>
          <span>
            {owners.length
              ? `Showing ${offset + 1} to ${offset + owners.length} of ${total} registered pet owners`
              : "Showing 0 registered pet owners"}
          </span>
          {pages > 1 && (
            <Pagination
              page={page}
              pageCount={pages}
              previousLabel="Previous"
              aria-label="Client directory pages"
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
