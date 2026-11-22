import type { Metadata } from "next";
import { LazyShowcaseSections } from "./_components/LazyShowcaseSections";
import { BrandSection } from "./_sections/BrandSection";
import styles from "./showcase.module.css";

export const metadata: Metadata = {
  title: "UI Component Showcase · VertiVet",
  description: "Reusable UI elements in the VertiVet brand language.",
};

/**
 * Above the fold renders on the server; the component groups below are
 * lazy-loaded as the user scrolls.
 */
export default function ShowcasePage() {
  return (
    <main className={styles.page}>
      <BrandSection />
      <LazyShowcaseSections />
    </main>
  );
}
