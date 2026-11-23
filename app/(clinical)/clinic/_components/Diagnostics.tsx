import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "@/app/(app)/_lib/format";
import { ROUTES } from "@/app/shared/config/routes";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import {
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { Pagination } from "@/app/shared/ui/Pagination";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TableCell, TableRow } from "@/app/shared/ui/Table";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Text } from "@/app/shared/ui/Typography";
import {
  type ClinicalOrder,
  ORDER_FILTERS,
  ORDER_PAGE_SIZE,
  type OrderQuery,
  type OrdersPage,
  orderHref,
} from "../_lib/diagnostics";
import { SPECIES_LABELS } from "../_lib/registry";
import styles from "../registry.module.css";
import { CreateOrder, OrderReview } from "./OrderDialogs";
import { PracticeStats } from "./OverviewPanels";
import { RegistryTable } from "./RegistryTables";

const COLUMNS = [
  "Patient & Owner",
  "Diagnostic Test / Medication",
  "Order Date & Lab",
  "Ordering Vet",
  "Results Status",
  "Actions",
];

const STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  ordered: { label: "Ordered", tone: "primary" },
  ready: { label: "Ready for Review", tone: "accent" },
  released: { label: "Released", tone: "success" },
  active: { label: "Dispensed & Active", tone: "primary" },
  completed: { label: "Completed", tone: "neutral" },
} as const;

function OrdersTable({
  orders,
  canManage,
}: {
  orders: ClinicalOrder[];
  canManage: boolean;
}) {
  return (
    <RegistryTable
      label="Clinical diagnostic orders"
      columns={COLUMNS}
      empty={!orders.length}
    >
      {orders.map((order) => {
        const { patient, status, orderedAt } = order;
        const date = orderedAt && Number.isFinite(Date.parse(orderedAt));
        return (
          <TableRow key={order.id}>
            <TableCell>
              <div className={styles.identity}>
                <Avatar name={patient.name} shape="rounded" decorative />
                <div>
                  <Text variant="label" tone="heading">
                    {patient.name}
                  </Text>
                  <Text variant="supporting" tone="muted">
                    {[
                      patient.owner,
                      patient.species && SPECIES_LABELS[patient.species],
                      patient.age,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Text variant="label" tone="heading">
                {order.title}
              </Text>
              <Text variant="small" tone="muted">
                {[order.reference, order.notes].filter(Boolean).join(" · ")}
              </Text>
            </TableCell>
            <TableCell>
              {date ? (
                <time dateTime={orderedAt}>
                  {formatAppointmentDate(orderedAt)} ·{" "}
                  {formatAppointmentTime(orderedAt)}
                </time>
              ) : (
                "Date unavailable"
              )}
              {order.facility && (
                <Text variant="small" tone="muted">
                  {order.facility}
                </Text>
              )}
            </TableCell>
            <TableCell>{order.clinician ?? "Not recorded"}</TableCell>
            <TableCell>
              <Badge variant="soft" tone={STATUS[status].tone} size="sm">
                {STATUS[status].label}
              </Badge>
            </TableCell>
            <TableCell>
              <OrderReview order={order} canManage={canManage} />
            </TableCell>
          </TableRow>
        );
      })}
    </RegistryTable>
  );
}

export function Diagnostics({
  data,
  filters,
  canManage,
}: {
  data: OrdersPage;
  filters: OrderQuery;
  canManage: boolean;
}) {
  const { orders, counts, summary, page, total, orderablePatients } = data;
  const offset = (page - 1) * ORDER_PAGE_SIZE;
  const pageCount = Math.ceil(total / ORDER_PAGE_SIZE);
  const cards = [
    {
      label: "Pending Lab Reviews",
      value: `${summary.pendingLab} Awaiting Review`,
      icon: <StethoscopeIcon />,
    },
    {
      label: "Active Prescriptions",
      value: `${summary.activeRx} Active`,
      icon: <FileTextIcon />,
    },
    {
      label: "Pharmacy Dispensed",
      value: `${summary.dispensed} Dispensed`,
      icon: <CheckCircleIcon />,
    },
    {
      label: "Released Reports",
      value: `${summary.released} Released`,
      icon: <ClockIcon />,
    },
  ];
  return (
    <>
      <SectionHeader
        as="h1"
        title="Prescriptions & Diagnostic Lab Orders"
        description="Order lab tests, prepare prescriptions, review reports, and manage authorized refills."
        actions={
          canManage ? (
            <div className={styles.actions}>
              <CreateOrder kind="lab" patients={orderablePatients} />
              <CreateOrder kind="prescription" patients={orderablePatients} />
            </div>
          ) : undefined
        }
      />
      <PracticeStats cards={cards} />
      <div className={styles.toolbar}>
        <nav className={styles.tabs} aria-label="Order status">
          {ORDER_FILTERS.map(([filter, label]) => (
            <ButtonLink
              key={filter}
              href={orderHref({ ...filters, filter, page: 1 })}
              size="sm"
              variant="secondary"
              className={styles.tab}
              aria-current={filter === filters.filter ? "page" : undefined}
            >
              {label} ({counts[filter]})
            </ButtonLink>
          ))}
        </nav>
        <search aria-label="Search diagnostic orders">
          <form
            action={ROUTES.clinicalDashboard}
            className={styles.filters}
            key={filters.query}
          >
            <input type="hidden" name="view" value="diagnostics" />
            {filters.filter !== "all" && (
              <input type="hidden" name="orders" value={filters.filter} />
            )}
            <InputGroup size="sm" startAddon={<SearchIcon />}>
              <TextInput
                id="diagnostic-search"
                name="q"
                type="search"
                maxLength={100}
                defaultValue={filters.query}
                aria-label="Search by test, Rx number, or pet"
                placeholder="Search by test, Rx, or pet…"
              />
            </InputGroup>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>
        </search>
      </div>
      <div className={styles.panel}>
        <OrdersTable orders={orders} canManage={canManage} />
        <footer className={styles.footer}>
          <span>
            {orders.length
              ? `Showing ${offset + 1} to ${offset + orders.length} of ${total} clinical orders`
              : "Showing 0 clinical orders"}
          </span>
          {pageCount > 1 && (
            <Pagination
              page={page}
              pageCount={pageCount}
              previousLabel="Previous"
              aria-label="Diagnostic order pages"
              getPageHref={(nextPage) =>
                orderHref({ ...filters, page: nextPage })
              }
            />
          )}
        </footer>
      </div>
    </>
  );
}
