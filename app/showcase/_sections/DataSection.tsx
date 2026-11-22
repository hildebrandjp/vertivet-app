"use client";

import { Badge } from "@/app/shared/ui/Badge";
import { DataTable } from "@/app/shared/ui/DataTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/Table";
import { Demo, ShowcaseGroup } from "../_components/Demo";
import {
  APPOINTMENT_COLUMNS,
  APPOINTMENTS,
  PETS,
} from "../_data/showcase-data";
import styles from "../showcase.module.css";

const DEFAULT_SELECTED = ["a1"];
const getAppointmentId = (row: { id: string }) => row.id;

/** 04, 07, 10: tables and status indicators. */
export default function DataSection() {
  return (
    <ShowcaseGroup
      title="Data display"
      description="Tables and status indicators."
    >
      <Demo index="04" title="Table" subtitle="Basic data listing.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pet</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PETS.map((pet) => (
              <TableRow key={pet.name}>
                <TableCell>{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell>{pet.age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Demo>

      <Demo index="07" title="Badge" subtitle="Status indicators.">
        <div className={styles.stack}>
          <Badge tone="primary">Confirmed</Badge>
          <Badge tone="accent">Pending</Badge>
          <Badge tone="neutral">Inactive</Badge>
        </div>
        <div className={styles.row}>
          <Badge variant="soft" tone="success" dot>
            Healthy
          </Badge>
          <Badge variant="soft" tone="danger" dot>
            Overdue
          </Badge>
          <Badge variant="outline" tone="primary">
            New
          </Badge>
        </div>
      </Demo>

      <Demo index="10" title="Data Table" subtitle="Richer data listing.">
        <DataTable
          title="Appointments"
          caption="Upcoming appointments"
          data={APPOINTMENTS}
          columns={APPOINTMENT_COLUMNS}
          getRowId={getAppointmentId}
          searchPlaceholder="Search patients…"
          selectable
          defaultSelectedIds={DEFAULT_SELECTED}
          pageSize={3}
        />
      </Demo>
    </ShowcaseGroup>
  );
}
