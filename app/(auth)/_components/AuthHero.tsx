import Image from "next/image";
import { cx } from "@/app/shared/utils/cx";
import { AUTH_HERO } from "../_lib/content";
import styles from "./AuthHero.module.css";

/**
 * Brand panel: illustration, headline and pitch. The image is decorative
 * (empty alt) and lazy: on phones it sits below the form, so it is only
 * fetched when the user scrolls towards it.
 */
export function AuthHero({ className }: { className?: string }) {
  const { image, title, description } = AUTH_HERO;
  return (
    <section className={cx(styles.hero, className)} aria-label="About VertiVet">
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt=""
        loading="lazy"
        sizes="(min-width: 960px) 360px, 70vw"
        className={styles.image}
      />
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
    </section>
  );
}
