import Image from "next/image";
import { Suspense } from "react";
import { APP_LOCALE } from "@/app/shared/config/locale";
import { ROUTES } from "@/app/shared/config/routes";
import { ButtonLink } from "@/app/shared/ui/Button";
import { formatList } from "@/app/shared/utils/text";
import { DASHBOARD_CONTENT } from "../../_lib/content";
import { getCurrentUser, getPets } from "../../_lib/data/dal";
import styles from "./WelcomeBanner.module.css";

const { eyebrow, tagline, image } = DASHBOARD_CONTENT.welcome;
const GENERIC_PETS_LINE =
  "Manage visits and keep your pets feeling their best.";

async function FirstName() {
  const user = await getCurrentUser();
  return <>, {user.firstName}</>;
}

async function PetsLine() {
  const pets = await getPets();
  if (pets.length === 0)
    return <>Add your first pet to start managing visits.</>;
  const names = formatList(
    pets.slice(0, 3).map((pet) => pet.name),
    APP_LOCALE,
  );
  return <>Manage visits and keep {names} feeling their best.</>;
}

/**
 * Hero greeting. Everything is static except the name and pet names, which
 * stream into the already-painted banner (no layout shift: inline text).
 */
export function WelcomeBanner() {
  return (
    <section className={styles.banner} aria-labelledby="welcome-title">
      <div className={styles.content}>
        <span className={styles.accentBar} aria-hidden="true" />
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id="welcome-title" className={styles.title}>
          Welcome back
          <Suspense fallback={null}>
            <FirstName />
          </Suspense>
          .
        </h1>
        <p className={styles.tagline}>{tagline}</p>
        <p className={styles.supporting}>
          <Suspense fallback={GENERIC_PETS_LINE}>
            <PetsLine />
          </Suspense>
        </p>
        <ButtonLink
          href={ROUTES.newAppointment}
          size="lg"
          className={styles.cta}
        >
          Book appointment
        </ButtonLink>
      </div>
      <div className={styles.media}>
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt=""
          preload
          sizes="(min-width: 1024px) 380px, 100vw"
          className={styles.image}
        />
      </div>
    </section>
  );
}
