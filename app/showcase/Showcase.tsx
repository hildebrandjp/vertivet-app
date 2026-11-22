"use client";

import { type ReactNode, useEffect, useState } from "react";
import { getStoredTheme, setTheme, type Theme } from "../shared/theme/theme";
import {
  Accordion,
  AccordionItem,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Collapsible,
  Combobox,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
  DatePicker,
  DateStrip,
  DescriptionList,
  Drawer,
  DropdownMenu,
  Eyebrow,
  Field,
  Heading,
  InputGroup,
  Logo,
  Menubar,
  type MenuItem,
  Pagination,
  Sidebar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextArea,
  TextInput,
} from "../shared/ui";
import styles from "./showcase.module.css";

/* ------------------------------------------------------------------ Data */

const PALETTE = [
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
];

const BREEDS = [
  { value: "labrador", label: "Labrador Retriever" },
  { value: "golden", label: "Golden Retriever" },
  { value: "german-shepherd", label: "German Shepherd" },
  { value: "beagle", label: "Beagle" },
  { value: "bulldog", label: "French Bulldog" },
  { value: "poodle", label: "Poodle" },
];

const PETS = [
  { name: "Luna", species: "Dog", age: "3 years" },
  { name: "Milo", species: "Cat", age: "2 years" },
  { name: "Max", species: "Dog", age: "5 years" },
];

interface Appointment {
  id: string;
  patient: string;
  date: Date;
  status: "Confirmed" | "Pending" | "Inactive";
}

const APPOINTMENTS: Appointment[] = [
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

const APPOINTMENT_COLUMNS: DataTableColumn<Appointment>[] = [
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

const ACTION_ITEMS: MenuItem[] = [
  { id: "edit", label: "Edit appointment" },
  { id: "view", label: "View patient record" },
  { id: "reschedule", label: "Reschedule" },
  { id: "cancel", label: "Cancel appointment", tone: "danger" },
];

const MENUBAR = [
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
      { type: "separator" as const, id: "sep" },
      { id: "about", label: "About VertiVet" },
    ],
  },
];

const STRIP_DATES = [21, 22, 23, 24, 25].map((d) => new Date(2026, 9, d));

/* ------------------------------------------------------------- Helpers */

function Demo({
  index,
  title,
  subtitle,
  children,
}: {
  index: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.demo}>
      <header className={styles.demoHeader}>
        <Heading level={4} as="h3">
          {index} {title}
        </Heading>
        <Text variant="small">{subtitle}</Text>
      </header>
      <div className={styles.demoBody}>{children}</div>
    </section>
  );
}

function ThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>("light");
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setTheme(stored);
      setThemeState(stored);
    }
  }, []);
  return (
    <fieldset className={styles.themeSwitcher}>
      <legend className="sr-only">Theme</legend>
      {(["light", "dark", "system"] as const).map((option) => (
        <Button
          key={option}
          size="sm"
          variant={theme === option ? "primary" : "ghost"}
          aria-pressed={theme === option}
          onClick={() => {
            setTheme(option);
            setThemeState(option);
          }}
        >
          {option[0].toUpperCase() + option.slice(1)}
        </Button>
      ))}
    </fieldset>
  );
}

/* --------------------------------------------------------------- Page */

export function Showcase() {
  const [breed, setBreed] = useState<string | null>("labrador");
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 23));
  const [stripDate, setStripDate] = useState<Date | null>(
    new Date(2026, 9, 23),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [email, setEmail] = useState("emma@");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const confirm = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDialogOpen(false);
    }, 1200);
  };

  return (
    <main className={styles.page}>
      {/* ============================================ Brand / moodboard */}
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <Logo size="lg" />
          <ThemeSwitcher />
        </div>
        <Heading level={1}>Clinical clarity. A caring presence.</Heading>
        <Text tone="muted">
          Airy surfaces, confident blue interactions and a small touch of
          warmth.
        </Text>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Heading level={2}>The care palette</Heading>
          <Text variant="supporting">
            Seven purposeful colors. One calm visual system.
          </Text>
        </div>
        <div className={styles.palette}>
          {PALETTE.map((color) => (
            <div key={color.token} className={styles.swatch}>
              <div
                className={styles.swatchColor}
                style={{ background: `var(${color.token})` }}
              />
              <Text variant="label">{color.name}</Text>
              <Text variant="small">{color.hex}</Text>
              <Text variant="small">{color.use}</Text>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.twoUp}>
        <Card>
          <CardHeader>
            <CardTitle>A reassuring voice</CardTitle>
            <CardDescription>
              Montserrat brings confidence. Inter keeps every detail clear.
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.typeScale}>
            <Heading level={1}>Care with confidence.</Heading>
            <Heading level={2}>Your pet&apos;s wellbeing</Heading>
            <Heading level={3}>Annual wellness check</Heading>
            <Text>A little care today. A healthier tomorrow.</Text>
            <Text variant="label">Preferred appointment date</Text>
            <Text variant="supporting">
              We&apos;ll help you find the right care for your pet.
            </Text>
            <Text variant="eyebrow">Next appointment</Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care, made tangible</CardTitle>
            <CardDescription>
              Small UI studies, not a screen. The system working together.
            </CardDescription>
          </CardHeader>
          <div className={styles.tangible}>
            <Sidebar
              className={styles.miniSidebar}
              header={<Logo size="sm" inverse />}
              activeHref="/appointments"
              items={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/pets", label: "Pets" },
                { href: "/appointments", label: "Appointments" },
                { href: "/settings", label: "Settings" },
              ]}
            />
            <Card variant="muted" padding="sm" className={styles.upcoming}>
              <Card padding="sm">
                <Eyebrow dot>Upcoming care</Eyebrow>
                <CardTitle level={4}>Luna&apos;s wellness visit</CardTitle>
                <CardDescription>
                  Friday, 23 October · 10:30 AM
                  <br />
                  Dr. Emma Wilson
                </CardDescription>
                <Button fullWidth size="sm">
                  Book an appointment
                </Button>
              </Card>
            </Card>
          </div>
          <DateStrip
            dates={STRIP_DATES}
            value={stripDate}
            onChange={setStripDate}
          />
          <Field
            label="Pet's name"
            hint="Use the name on your pet's health record."
          >
            <TextInput defaultValue="Luna" />
          </Field>
        </Card>
      </div>

      {/* =========================================== Component showcase */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Heading level={2}>UI Component Showcase</Heading>
          <Text variant="supporting">
            A complete library of reusable UI elements in the VertiVet brand
            language.
          </Text>
        </div>

        <div className={styles.grid}>
          <Demo
            index="01"
            title="Input Fields"
            subtitle="State examples for text inputs."
          >
            <Field label="Email address · Normal">
              <TextInput type="email" defaultValue="emma@vertivet.com" />
            </Field>
            <Field label="Email address · Focus">
              <TextInput
                type="email"
                defaultValue="emma@vertivet.com"
                data-focused=""
              />
            </Field>
            <Field
              label="Email address · Live validation"
              error={emailValid ? undefined : "Enter a valid email address."}
              success={emailValid ? "Email address is valid." : undefined}
            >
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Email address · Disabled" disabled>
              <TextInput type="email" defaultValue="emma@vertivet.com" />
            </Field>
          </Demo>

          <Demo
            index="02"
            title="Accordion"
            subtitle="Expandable content sections."
          >
            <Accordion defaultValue={["vaccination"]}>
              <AccordionItem value="vaccination" title="Vaccination history">
                Rabies · 23 Oct 2026
                <br />
                Distemper · 23 Oct 2026
              </AccordionItem>
              <AccordionItem value="allergies" title="Allergies">
                No known allergies.
              </AccordionItem>
            </Accordion>
          </Demo>

          <Demo
            index="03"
            title="Input Group"
            subtitle="Grouped form controls."
          >
            <Field
              label="Clinic email"
              hint="Shared border, attached prefix and input."
            >
              <InputGroup startAddon="@">
                <TextInput placeholder="care@vertivet.com" />
              </InputGroup>
            </Field>
            <Field label="Weight">
              <InputGroup endAddon="kg">
                <TextInput type="number" defaultValue="24.5" />
              </InputGroup>
            </Field>
          </Demo>

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

          <Demo index="05" title="Breadcrumb" subtitle="Navigation path.">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Patients", href: "/patients" },
                { label: "Luna" },
              ]}
            />
          </Demo>

          <Demo
            index="06"
            title="Button"
            subtitle="Primary and secondary actions."
          >
            <Button fullWidth>Book appointment</Button>
            <Button fullWidth variant="secondary">
              View patient
            </Button>
            <Button fullWidth disabled>
              Book appointment
            </Button>
            <div className={styles.row}>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
              <Button size="sm" variant="accent">
                Accent
              </Button>
              <Button size="sm" variant="danger">
                Delete
              </Button>
              <Button size="sm" loading>
                Saving
              </Button>
            </div>
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

          <Demo index="08" title="Checkbox" subtitle="Selection controls.">
            <Checkbox label="Send appointment reminders" />
            <Checkbox label="Send appointment reminders" defaultChecked />
            <Checkbox label="Send appointment reminders" disabled />
            <Checkbox label="Some pets selected" indeterminate readOnly />
          </Demo>

          <Demo index="09" title="Combobox" subtitle="Dropdown selection.">
            <Field label="Breed">
              <Combobox
                options={BREEDS}
                value={breed}
                onValueChange={setBreed}
                placeholder="Select a breed"
                searchPlaceholder="Search breeds…"
              />
            </Field>
          </Demo>

          <Demo index="10" title="Data Table" subtitle="Richer data listing.">
            <DataTable
              title="Appointments"
              caption="Upcoming appointments"
              data={APPOINTMENTS}
              columns={APPOINTMENT_COLUMNS}
              getRowId={(row) => row.id}
              searchPlaceholder="Search patients…"
              selectable
              defaultSelectedIds={["a1"]}
              pageSize={3}
            />
          </Demo>

          <Demo index="11" title="Date Picker" subtitle="Calendar selection.">
            <Calendar value={date} onChange={setDate} />
            <Field label="Preferred appointment date">
              <DatePicker
                value={date}
                onChange={setDate}
                min={new Date(2026, 9, 1)}
              />
            </Field>
          </Demo>

          <Demo index="12" title="Dialog" subtitle="Modal confirmation.">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <ConfirmDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Confirm appointment"
              description="Book Luna's wellness visit with Dr. Emma Wilson on 23 October at 10:30 AM?"
              loading={saving}
              onConfirm={confirm}
            />
          </Demo>

          <Demo index="13" title="Drawer" subtitle="Sidebar navigation.">
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open patient details
            </Button>
            <Drawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              title="Patient details"
              subtitle="Luna · Labrador Retriever"
              footer={<Button fullWidth>View full record</Button>}
            >
              <Text variant="eyebrow" className={styles.drawerEyebrow}>
                Patient record
              </Text>
              <DescriptionList
                items={[
                  { term: "Owner", details: "Sarah Mitchell" },
                  { term: "Age", details: "3 years" },
                  { term: "Weight", details: "24.5 kg" },
                  { term: "Next visit", details: "23 Oct 2026" },
                ]}
              />
            </Drawer>
          </Demo>

          <Demo index="14" title="Field" subtitle="Basic text field.">
            <Field
              label="Pet's name"
              required
              hint="Use the name on your pet's health record."
            >
              <TextInput defaultValue="Luna" />
            </Field>
          </Demo>

          <Demo index="15" title="Dropdown Menu" subtitle="Contextual actions.">
            <DropdownMenu label="Appointment actions" items={ACTION_ITEMS} />
          </Demo>

          <Demo index="16" title="Menubar" subtitle="Top navigation.">
            <Menubar menus={MENUBAR} />
          </Demo>

          <Demo index="17" title="Pagination" subtitle="Page navigation.">
            <Pagination page={page} pageCount={3} onPageChange={setPage} />
            <Pagination page={page} pageCount={12} onPageChange={setPage} />
          </Demo>

          <Demo index="18" title="Text Area" subtitle="Multi-line input.">
            <Field
              label="Clinical notes"
              hint="Record symptoms and relevant observations."
            >
              <TextArea
                defaultValue={
                  "Patient is experiencing mild coughing.\nAppetite and activity levels are normal."
                }
              />
            </Field>
          </Demo>

          <Demo index="19" title="Collapsible" subtitle="Expandable section.">
            <Collapsible title="Medical history" defaultOpen>
              No previous conditions recorded.
              <br />
              Last reviewed: 23 October 2026
            </Collapsible>
            <Collapsible title="Medical history">Nothing to show.</Collapsible>
          </Demo>
        </div>
      </section>
    </main>
  );
}
