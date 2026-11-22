import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/Table";
import type { UpcomingVisit } from "../../_lib/data/dal";
import {
  APPOINTMENT_STATUS,
  describePet,
  formatAppointmentDate,
  formatAppointmentTime,
} from "../../_lib/format";
import styles from "./AppointmentsTable.module.css";

const COLUMNS = ["Pet", "Service", "Date & Time", "Status"] as const;

interface AppointmentsTableProps {
  visits: UpcomingVisit[];
  /** Reference date for pet ages. */
  today: Date;
  caption: string;
}

/** Presentational appointments table (server-rendered, zero client JS). */
export function AppointmentsTable({
  visits,
  today,
  caption,
}: AppointmentsTableProps) {
  return (
    <Table className={styles.table} aria-label={caption}>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => {
          const status = APPOINTMENT_STATUS[visit.status];
          return (
            <TableRow key={visit.id}>
              <TableCell>
                {visit.pet ? (
                  <span className={styles.pet}>
                    <Avatar
                      name={visit.pet.name}
                      src={visit.pet.photoUrl}
                      shape="rounded"
                      decorative
                    />
                    <span className={styles.stack}>
                      <span className={styles.primary}>{visit.pet.name}</span>
                      <span className={styles.secondary}>
                        {describePet(visit.pet, today)}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className={styles.secondary}>Unknown pet</span>
                )}
              </TableCell>
              <TableCell className={styles.service}>{visit.service}</TableCell>
              <TableCell>
                <time dateTime={visit.startsAt} className={styles.stack}>
                  <span className={styles.primary}>
                    {formatAppointmentDate(visit.startsAt)}
                  </span>
                  <span className={styles.secondary}>
                    {formatAppointmentTime(visit.startsAt)}
                  </span>
                </time>
              </TableCell>
              <TableCell>
                <Badge tone={status.tone} size="lg">
                  {status.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Same geometry as the table, so streaming in causes no layout shift. */
export function AppointmentsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <span className="sr-only">Loading appointments…</span>
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows.
        <div key={index} className={styles.skeletonRow}>
          <Skeleton shape="rect" width="40px" height="40px" />
          <Skeleton width="30%" />
          <Skeleton width="20%" />
          <Skeleton shape="rect" width="112px" height="32px" />
        </div>
      ))}
    </div>
  );
}
