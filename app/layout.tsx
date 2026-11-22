import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

// Font configuration: exposed as CSS variables consumed by the design tokens
// (--font-family-heading / --font-family-body in shared/theme/tokens.css).
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertivet App",
  description:
    "A web application for managing veterinary services and pet care.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Root HTML entrypoint. `data-theme` selects the token set: light | dark | system.
    <html
      lang="en"
      data-theme="light"
      className={`${montserrat.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
