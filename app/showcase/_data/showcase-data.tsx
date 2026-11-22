import { Badge } from "@/app/shared/ui/Badge";
import type { ComboboxOption } from "@/app/shared/ui/Combobox";
import type { DataTableColumn } from "@/app/shared/ui/DataTable";
import type { MenuItem } from "@/app/shared/ui/Menu";
import type { MenubarMenu } from "@/app/shared/ui/Menubar";

export const PALETTE = [
  {
    name: "Navy Blue",
    token: "--palette-navy-800",
    hex: "#0B3A6B",
    use: "Sidebar, headings & branding",
  },
  {
    name: "Royal Blue",
    token: "--palette-royal-600",
    hex: "#1E6FD9",
    use: "Primary buttons, active states & selected dates",
  },
  {
    name: "Golden Yellow",
    token: "--palette-golden-400",
    hex: "#FFCA3A",
    use: "Small highlights & important accents",
  },
  {
    name: "White",
    token: "--palette-white",
    hex: "#FFFFFF",
    use: "Cards & main surfaces",
  },
  {
    name: "Light Gray",
    token: "--palette-gray-200",
    hex: "#E5E7EB",
    use: "Borders & dividers",
  },
  {
    name: "Soft Background",
    token: "--palette-slate-50",
    hex: "#F8FAFC",
    use: "Application background",
  },
  {
    name: "Slate Gray",
    token: "--palette-slate-600",
    hex: "#475569",
    use: "Supporting text & secondary information",
  },
] as const;

export const BREEDS: ComboboxOption[] = [
  { value: "labrador", label: "Labrador Retriever" },
  { value: "golden", label: "Golden Retriever" },
  { value: "german-shepherd", label: "German Shepherd" },
  { value: "beagle", label: "Beagle" },
  { value: "bulldog", label: "French Bulldog" },
  { value: "poodle", label: "Poodle" },
];

export const PETS = [
  { name: "Luna", species: "Dog", age: "3 years" },
  { name: "Milo", species: "Cat", age: "2 years" },
  { name: "Max", species: "Dog", age: "5 years" },
];

export interface Appointment {
  id: string;
  patient: string;
  date: Date;
  status: "Confirmed" | "Pending" | "Inactive";
}

export const APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    patient: "Luna",
    date: new Date(2026, 9, 23),
    status: "Confirmed",
  },
  { id: "a2", patient: "Milo", date: new Date(2026, 9, 24), status: "Pending" },
  {
    id: "a3",
    patient: "Max",
    date: new Date(2026, 9, 25),
    status: "Confirmed",
  },
  {
    id: "a4",
    patient: "Bella",
    date: new Date(2026, 9, 26),
    status: "Inactive",
  },
  {
    id: "a5",
    patient: "Charlie",
    date: new Date(2026, 9, 27),
    status: "Pending",
  },
  {
    id: "a6",
    patient: "Daisy",
    date: new Date(2026, 9, 28),
    status: "Confirmed",
  },
];

const STATUS_TONE = {
  Confirmed: "primary",
  Pending: "accent",
  Inactive: "neutral",
} as const;

export const APPOINTMENT_COLUMNS: DataTableColumn<Appointment>[] = [
  {
    id: "patient",
    header: "Patient",
    cell: (r) => r.patient,
    sortValue: (r) => r.patient,
  },
  {
    id: "date",
    header: "Date",
    cell: (r) =>
      r.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    sortValue: (r) => r.date,
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <Badge size="sm" tone={STATUS_TONE[r.status]}>
        {r.status}
      </Badge>
    ),
    searchValue: (r) => r.status,
  },
];

export const ACTION_ITEMS: MenuItem[] = [
  { id: "edit", label: "Edit appointment" },
  { id: "view", label: "View patient record" },
  { id: "reschedule", label: "Reschedule" },
  { id: "cancel", label: "Cancel appointment", tone: "danger" },
];

export const MENUBAR: MenubarMenu[] = [
  {
    id: "file",
    label: "File",
    items: [
      { id: "new", label: "New patient", shortcut: "Ctrl+N" },
      { id: "export", label: "Export…" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { id: "undo", label: "Undo", shortcut: "Ctrl+Z" },
      { id: "redo", label: "Redo", disabled: true },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { id: "calendar", label: "Calendar" },
      { id: "list", label: "List" },
    ],
  },
  {
    id: "help",
    label: "Help",
    items: [
      { id: "docs", label: "Documentation" },
      { type: "separator", id: "sep" },
      { id: "about", label: "About VertiVet" },
    ],
  },
];

export const STRIP_DATES = [21, 22, 23, 24, 25].map(
  (d) => new Date(2026, 9, d),
);
export const SAMPLE_DATE = new Date(2026, 9, 23);
