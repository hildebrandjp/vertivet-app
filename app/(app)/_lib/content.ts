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

/** Front-desk contact shown in help callouts. */
export const CLINIC_CONTACT = {
  phone: "(555) 123-4567",
  phoneHref: "+15551234567",
} as const;

/** Guidance cards under the booking calendar. */
export const BOOKING_TIPS = [
  {
    id: "efficiency",
    icon: "info",
    title: "Clinical Efficiency",
    body: "Booking is prioritized based on severity. Same-day emergency slots are held until 9:00 AM.",
  },
  {
    id: "preparation",
    icon: "info",
    title: "Preparation Guide",
    body: "Please arrive 15 minutes before your slot with your pet's vaccination records.",
  },
  {
    id: "cancellation",
    icon: "calendar",
    title: "Cancellation Policy",
    body: "Reschedule at least 24 hours in advance to avoid a short-notice facility fee.",
  },
] as const;
