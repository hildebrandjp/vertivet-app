/** Every app URL lives here so links and redirects never drift apart. */
export const ROUTES = {
  home: "/",
  login: "/login",
  clinicalLogin: "/clinic/login",
  clinicalDashboard: "/clinic",
  clinicalRegistryExport: "/clinic/registry/export",
  forgotPassword: "/forgot-password",
  requestAccount: "/request-account",
  dashboard: "/dashboard",
  pets: "/pets",
  newPet: "/pets/new",
  appointments: "/appointments",
  newAppointment: "/appointments/new",
  medicalRecords: "/medical-records",
  settings: "/settings",
  showcase: "/showcase",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Builders for parameterised URLs. */
export const routeTo = {
  bookPet: (petId: string) =>
    `${ROUTES.newAppointment}?${new URLSearchParams({ petId })}`,
  petRecords: (petId: string, recordId?: string) =>
    `${ROUTES.medicalRecords}?${new URLSearchParams(recordId ? { petId, recordId } : { petId })}`,
  pet: (id: string) => `${ROUTES.pets}/${encodeURIComponent(id)}`,
  appointment: (id: string) =>
    `${ROUTES.appointments}/${encodeURIComponent(id)}`,
};
