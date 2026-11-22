"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/app/shared/ui/LazySection";

/*
 * Each group is code-split (next/dynamic) and only mounted when scrolled
 * near (LazySection), so its JavaScript and CSS are fetched on demand.
 * dynamic() must live in a Client Component for code splitting to apply.
 */
const FormsSection = dynamic(() => import("../_sections/FormsSection"));
const ActionsSection = dynamic(() => import("../_sections/ActionsSection"));
const DataSection = dynamic(() => import("../_sections/DataSection"));
const OverlaysSection = dynamic(() => import("../_sections/OverlaysSection"));

export function LazyShowcaseSections() {
  return (
    <>
      <LazySection minHeight="1100px">
        <FormsSection />
      </LazySection>
      <LazySection minHeight="760px">
        <ActionsSection />
      </LazySection>
      <LazySection minHeight="560px">
        <DataSection />
      </LazySection>
      <LazySection minHeight="420px">
        <OverlaysSection />
      </LazySection>
    </>
  );
}
