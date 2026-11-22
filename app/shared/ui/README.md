# VertiVet UI kit

Reusable components for the VertiVet frontend. Plain CSS Modules + CSS custom
properties, no CSS framework. A live demo of every component is at
[`/showcase`](../../showcase/Showcase.tsx).

```tsx
import { Button, Field, TextInput } from "@/app/shared/ui";
```

## Folder layout

| Path                        | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `shared/theme/tokens.css`   | Design tokens + themes (imported by `app/globals.css`)    |
| `shared/theme/theme.ts`     | `setTheme()`, `getTheme()`, `getStoredTheme()`            |
| `shared/common.ts`          | Shared types: `Size`, `ValidationState`, `Tone`, `Option` |
| `shared/size.ts`            | Defaults: `DEFAULT_SIZE`, `DEFAULT_PLACEHOLDER`, locale   |
| `shared/hooks/*`            | `useControllableState`, `useDismiss`, `useModalDialog`, … |
| `shared/utils/*`            | `cx`, `mergeRefs`, date helpers                           |
| `shared/ui/*`               | Components (`Name.tsx` + `Name.module.css`)               |

## Theming

Tokens have three layers. **Components only use semantic tokens.**

1. `--palette-*`: raw brand colours (navy `#0B3A6B`, royal `#1E6FD9`, golden `#FFCA3A`, …)
2. `--color-*`: meaning (`--color-primary`, `--color-text-muted`, `--color-border`, …)
3. Scales: `--space-*`, `--radius-*`, `--font-size-*`, `--control-height-*`, `--shadow-*`

Switch themes with the `data-theme` attribute on `<html>` or on any subtree:

```tsx
import { setTheme } from "@/app/shared/theme/theme";
setTheme("dark"); // "light" | "dark" | "system"
```

To add a theme, copy the `[data-theme="dark"]` block in `tokens.css` and
change the values. To rebrand, change the palette layer only.

## Conventions

- **Variants use data attributes**: `data-variant`, `data-size`, `data-state`.
  CSS targets `.button[data-variant="secondary"]`, so there are no class-name
  combinations to keep in sync.
- **Private variables**: each component defines `--_bg`, `--_height`, etc. at
  its root. Override them from outside with a `className` for one-off tweaks.
- **Sizes**: `sm | md | lg | xl` everywhere (`md` default).
- **Controlled or uncontrolled**: stateful components accept `value` /
  `defaultValue` / `onValueChange` (or `open` / `defaultOpen` /
  `onOpenChange`).
- **Native first**: Dialog/Drawer use `<dialog>`, Checkbox and DateStrip
  use real inputs, and Accordion uses `<button aria-expanded>`, so keyboard
  and screen-reader support come from the browser.
- **`Field` wiring**: put any control inside `<Field>` and it receives `id`,
  `aria-describedby`, `aria-invalid`, `required`, `disabled`, state and size.
- **Server vs client**: Button, Badge, Card, Table, Breadcrumb, Pagination,
  Typography, Logo and DescriptionList have no `"use client"` and render in
  Server Components. The rest are Client Components. Props that are functions
  (DataTable `columns`, `onChange`, …) must come from a Client Component.

## Components

| #  | Moodboard       | Component(s)                                    |
| -- | --------------- | ----------------------------------------------- |
| 01 | Input Fields    | `TextInput` (`state`: default / error / valid)  |
| 02 | Accordion       | `Accordion`, `AccordionItem`                    |
| 03 | Input Group     | `InputGroup` (`startAddon`, `endAddon`)         |
| 04 | Table           | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| 05 | Breadcrumb      | `Breadcrumb`                                    |
| 06 | Button          | `Button`, `ButtonLink`, `IconButton`            |
| 07 | Badge           | `Badge` (`tone`, `variant`)                     |
| 08 | Checkbox        | `Checkbox` (incl. `indeterminate`)              |
| 09 | Combobox        | `Combobox`                                      |
| 10 | Data Table      | `DataTable` (search, sort, select, paginate)    |
| 11 | Date Picker     | `Calendar` (inline), `DatePicker` (popover)     |
| 12 | Dialog          | `Dialog`, `ConfirmDialog`                       |
| 13 | Drawer          | `Drawer` (+ `DescriptionList`)                  |
| 14 | Field           | `Field` (label, hint, error, success)           |
| 15 | Dropdown Menu   | `DropdownMenu` (+ `MenuList`)                   |
| 16 | Menubar         | `Menubar`                                       |
| 17 | Pagination      | `Pagination` (buttons or links)                 |
| 18 | Text Area       | `TextArea`                                      |
| 19 | Collapsible     | `Collapsible`                                   |
| –  | Brand           | `Logo`, `Heading`, `Text`, `Eyebrow`, `Card*`, `Sidebar`, `DateStrip`, icons |

## Examples

```tsx
<Field label="Email address" error={invalid && "Enter a valid email address."}>
  <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>

<Field label="Breed">
  <Combobox options={breeds} value={breed} onValueChange={setBreed} searchPlaceholder="Search breeds…" />
</Field>

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirm appointment"
  description="Book Luna's wellness visit with Dr. Emma Wilson?"
  loading={saving}
  onConfirm={save}
/>

<DataTable
  title="Appointments"
  data={rows}
  getRowId={(r) => r.id}
  selectable
  columns={[
    { id: "patient", header: "Patient", cell: (r) => r.patient, sortValue: (r) => r.patient },
    { id: "status", header: "Status", cell: (r) => <Badge tone="accent">{r.status}</Badge> },
  ]}
/>
```

## Adding a component

1. Create `Name.tsx` + `Name.module.css` in this folder.
2. Use only `--color-*` and scale tokens, never hex values or `--palette-*`.
3. Express variants as `data-*` attributes and accept `className`.
4. Add `"use client"` only if it uses state, effects, context or event handlers.
5. Export it from `index.ts` and add a demo to `/showcase`.
