/**
 * Static dashboard copy and imagery. Replace the placeholder SVGs with the
 * final photos (and update width/height) when the assets are available.
 */
export const DASHBOARD_CONTENT = {
  welcome: {
    eyebrow: "Your pet's health, all in one place",
    tagline: "A little care today. A healthier tomorrow.",
    image: {
      src: "/images/dashboard/welcome-vet.svg",
      width: 560,
      height: 440,
    },
  },
  clinic: {
    image: { src: "/images/dashboard/clinic.svg", width: 520, height: 420 },
    alt: "VertiVet clinic reception",
  },
} as const;
