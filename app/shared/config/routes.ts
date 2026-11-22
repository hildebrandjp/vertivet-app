/** Every app URL lives here so links and redirects never drift apart. */
export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  requestAccount: "/request-account",
  dashboard: "/dashboard",
  showcase: "/showcase",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
