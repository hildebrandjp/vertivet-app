import type { ReactNode } from "react";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/Table";
import { canChangeAppointment } from "../../_lib/data/appointment-policy";
import type { UpcomingVisit } from "../../_lib/data/dal";
import {
  APPOINTMENT_STATUS,
  formatAppointmentDate,
  formatAppointmentTime,
  formatDuration,
  formatSpecies,
} from "../../_lib/format";
import styles from "../appointments.module.css";
import { VisitActions } from "./VisitActions";

const COLUMNS = [
  "Pet & Patient",
  "Service & Consultation",
  "Date & Time",
  "Practitioner",
  "Status",
  "Actions",
];

function CellText({
  title,
  description,
}: {
  title: ReactNode;
  description?: string | null;
}) {
  return (
    <div className={styles.cellText}>
      <span>{title}</span>
      {description && <span className={styles.secondary}>{description}</span>}
    </div>
  );
}

export function OwnerVisitsTable({
  visits,
  now,
  today,
}: {
  visits: UpcomingVisit[];
  now: number;
  today: string;
}) {
  return (
    <Table
      aria-label="Owner appointments"
      className={styles.table}
      wrapperClassName={styles.tableScroll}
    >
      <TableHeader className={styles.tableHeader}>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableHead
              key={column}
              align={column === "Actions" ? "end" : "start"}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.length === 0 && (
          <TableRow>
            <TableCell colSpan={COLUMNS.length} className={styles.empty}>
              No appointments match these filters.
            </TableCell>
          </TableRow>
        )}
        {visits.map((visit) => {
          const pet = visit.pet;
          const status = APPOINTMENT_STATUS[visit.status];
          const dateLabel = `${formatAppointmentDate(visit.startsAt)} · ${formatAppointmentTime(visit.startsAt)}`;
          const details = [
            visit.description,
            visit.durationMinutes && formatDuration(visit.durationMinutes),
          ]
            .filter(Boolean)
            .join(" · ");
          const canConfirm = canChangeAppointment(visit, "confirm", now);
          const canReschedule = canChangeAppointment(visit, "reschedule", now);
          return (
            <TableRow key={visit.id}>
              <TableCell>
                {pet ? (
                  <div className={styles.pet}>
                    <Avatar
                      name={pet.name}
                      src={pet.photoUrl}
                      size="md"
                      shape="rounded"
                      decorative
                    />
                    <CellText
                      title={pet.name}
                      description={`${formatSpecies(pet.species)} · ${pet.breed}`}
                    />
                  </div>
                ) : (
                  "Unknown pet"
                )}
              </TableCell>
              <TableCell>
                <CellText title={visit.service} description={details} />
              </TableCell>
              <TableCell>
                <CellText
                  title={<time dateTime={visit.startsAt}>{dateLabel}</time>}
                  description={
                    canConfirm ? "Awaiting owner confirmation" : undefined
                  }
                />
              </TableCell>
              <TableCell>
                <CellText
                  title={visit.provider ?? "Not assigned"}
                  description={visit.location}
                />
              </TableCell>
              <TableCell>
                <Badge
                  variant="soft"
                  size="sm"
                  shape="pill"
                  dot
                  tone={visit.status === "confirmed" ? "success" : status.tone}
                >
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell align="end">
                <VisitActions
                  id={visit.id}
                  startsAt={visit.startsAt}
                  summary={`${visit.service} for ${pet?.name ?? "this pet"}`}
                  description={[
                    dateLabel,
                    visit.provider,
                    visit.location,
                    status.label,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  serviceId={visit.serviceId}
                  today={today}
                  primary={
                    canConfirm
                      ? "confirm"
                      : canReschedule
                        ? "reschedule"
                        : undefined
                  }
                  canCancel={canChangeAppointment(visit, "cancel", now)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
