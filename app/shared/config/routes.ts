/** Every app URL lives here so links and redirects never drift apart. */
export const ROUTES = {
  home: "/",
  login: "/login",
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
  pet: (id: string) => `${ROUTES.pets}/${encodeURIComponent(id)}`,
  appointment: (id: string) =>
    `${ROUTES.appointments}/${encodeURIComponent(id)}`,
};
