import Image from "next/image";
import { DASHBOARD_CONTENT } from "../../_lib/content";
import styles from "./DashboardPanels.module.css";

const { image, alt } = DASHBOARD_CONTENT.clinic;

/** Clinic photo. Below the fold on phones, so it loads lazily. */
export function ClinicCard() {
  return (
    <figure className={styles.clinic}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        sizes="(min-width: 1180px) 340px, 100vw"
        className={styles.clinicImage}
      />
    </figure>
  );
}
