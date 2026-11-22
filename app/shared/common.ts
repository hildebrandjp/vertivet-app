/** Size scale shared by every sized component (maps to --control-* tokens). */
export type Size = "sm" | "md" | "lg" | "xl";

/** Visual validation state for form controls. */
export type ValidationState = "default" | "error" | "valid";

/** Colour intent used by badges and other status indicators. */
export type Tone = "primary" | "accent" | "neutral" | "success" | "danger";

/** Horizontal alignment used by tables and menus. */
export type Align = "start" | "center" | "end";

/** A selectable option (Combobox, menus, etc.). */
export interface Option<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}
