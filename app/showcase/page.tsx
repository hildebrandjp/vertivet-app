import type { Metadata } from "next";
import { Showcase } from "./Showcase";

export const metadata: Metadata = {
  title: "UI Component Showcase · VertiVet",
  description: "Reusable UI elements in the VertiVet brand language.",
};

export default function ShowcasePage() {
  return <Showcase />;
}
