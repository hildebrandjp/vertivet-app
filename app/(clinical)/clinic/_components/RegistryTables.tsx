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
import { Text } from "@/app/shared/ui/Typography";
import type { ClinicalEntry, ClinicalPatient } from "../_lib/model";
import { SPECIES_LABELS } from "../_lib/registry";
import styles from "../registry.module.css";
import { Email, Phone } from "./ClientContactLinks";
import { ClinicalAction } from "./ClinicalAction";
import { PatientChart } from "./PatientChart";

const PATIENT_COLUMNS = [
  "Patient & Species",
  "Primary Pet Owner",
  "Microchip ID",
  "Vaccination Status",
  "Actions",
];

export function RegistryTable({
  label,
  columns,
  empty,
  children,
}: {
  label: string;
  columns: string[];
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <Table
      aria-label={label}
      className={styles.table}
      wrapperClassName={styles.tableScroll}
    >
      <TableHeader className={styles.header}>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {empty ? (
          <TableRow>
            <TableCell colSpan={columns.length} className={styles.empty}>
              No records match these filters.
            </TableCell>
          </TableRow>
        ) : (
          children
        )}
      </TableBody>
    </Table>
  );
}

const VACCINATION_TONES = {
  current: "success",
  due: "accent",
  overdue: "danger",
} as const;

export function PatientsTable({
  patients,
  entries,
}: {
  patients: ClinicalPatient[];
  entries: ClinicalEntry[];
}) {
  const byPatient = Map.groupBy(entries, ({ patientId }) => patientId);
  return (
    <RegistryTable
      label="Patient registry"
      columns={PATIENT_COLUMNS}
      empty={!patients.length}
    >
      {patients.map((patient) => (
        <TableRow key={patient.id}>
          <TableCell>
            <div className={styles.identity}>
              <Avatar name={patient.name} shape="rounded" decorative />
              <div>
                <Text variant="label" tone="heading">
                  {patient.name}
                </Text>
                <Text variant="supporting" tone="muted">
                  {[
                    patient.species && SPECIES_LABELS[patient.species],
                    patient.breed,
                    patient.age,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Species not recorded"}
                </Text>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Text variant="label" tone="heading">
              {patient.owner}
            </Text>
            <div className={styles.contact}>
              <Phone value={patient.ownerPhone} />
              <Email value={patient.ownerEmail} />
            </div>
          </TableCell>
          <TableCell>
            <Text variant="label" tone="heading">
              {patient.chip ? `#${patient.chip}` : "Not recorded"}
            </Text>
            {patient.chip && (
              <Text
                variant="supporting"
                tone={patient.chipVerified ? "success" : "muted"}
              >
                {patient.chipVerified ? "Verified tag" : "Verification pending"}
              </Text>
            )}
          </TableCell>
          <TableCell>
            <Badge
              variant="soft"
              tone={
                patient.vaccination
                  ? VACCINATION_TONES[patient.vaccination.status]
                  : "neutral"
              }
              size="sm"
            >
              {patient.vaccination?.label ?? "Not recorded"}
            </Badge>
          </TableCell>
          <TableCell>
            <div className={styles.actions}>
              <PatientChart
                patient={patient}
                entries={byPatient.get(patient.id) ?? []}
                label="Medical Chart"
                primary
              />
              <ClinicalAction
                kind="microchip"
                id={patient.id}
                patient={patient.name}
                currentChip={patient.chip}
                label="Edit Chip"
                size="sm"
              />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </RegistryTable>
  );
}
