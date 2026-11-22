import { Button } from "@/app/shared/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/Card";
import { DateStrip } from "@/app/shared/ui/DateStrip";
import { Field } from "@/app/shared/ui/Field";
import { Logo } from "@/app/shared/ui/Logo";
import { Sidebar } from "@/app/shared/ui/Sidebar";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Eyebrow, Heading, Text } from "@/app/shared/ui/Typography";
import { ThemeSwitcher } from "../_components/ThemeSwitcher";
import { PALETTE, SAMPLE_DATE, STRIP_DATES } from "../_data/showcase-data";
import styles from "../showcase.module.css";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pets", label: "Pets" },
  { href: "/appointments", label: "Appointments" },
  { href: "/settings", label: "Settings" },
];

/**
 * Above-the-fold moodboard (Server Component). Only the interactive islands
 * inside it (theme switcher, sidebar, date strip, input) hydrate.
 */
export function BrandSection() {
  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <Logo size="lg" />
          <ThemeSwitcher />
        </div>
        <Heading level={1}>Clinical clarity. A caring presence.</Heading>
        <Text tone="muted">
          Airy surfaces, confident blue interactions and a small touch of
          warmth.
        </Text>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Heading level={2}>The care palette</Heading>
          <Text variant="supporting">
            Seven purposeful colors. One calm visual system.
          </Text>
        </div>
        <div className={styles.palette}>
          {PALETTE.map((color) => (
            <div key={color.token} className={styles.swatch}>
              <div
                className={styles.swatchColor}
                style={{ background: `var(${color.token})` }}
              />
              <Text variant="label">{color.name}</Text>
              <Text variant="small">{color.hex}</Text>
              <Text variant="small">{color.use}</Text>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.twoUp}>
        <Card>
          <CardHeader>
            <CardTitle>A reassuring voice</CardTitle>
            <CardDescription>
              Montserrat brings confidence. Inter keeps every detail clear.
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.typeScale}>
            <Heading level={1} as="p">
              Care with confidence.
            </Heading>
            <Heading level={2} as="p">
              Your pet&apos;s wellbeing
            </Heading>
            <Heading level={3} as="p">
              Annual wellness check
            </Heading>
            <Text>A little care today. A healthier tomorrow.</Text>
            <Text variant="label">Preferred appointment date</Text>
            <Text variant="supporting">
              We&apos;ll help you find the right care for your pet.
            </Text>
            <Text variant="eyebrow">Next appointment</Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care, made tangible</CardTitle>
            <CardDescription>
              Small UI studies, not a screen. The system working together.
            </CardDescription>
          </CardHeader>
          <div className={styles.tangible}>
            <Sidebar
              className={styles.miniSidebar}
              header={<Logo size="sm" inverse />}
              activeHref="/appointments"
              items={SIDEBAR_ITEMS}
            />
            <Card variant="muted" padding="sm" className={styles.upcoming}>
              <Card padding="sm">
                <Eyebrow dot>Upcoming care</Eyebrow>
                <CardTitle level={4}>Luna&apos;s wellness visit</CardTitle>
                <CardDescription>
                  Friday, 23 October · 10:30 AM
                  <br />
                  Dr. Emma Wilson
                </CardDescription>
                <Button fullWidth size="sm">
                  Book an appointment
                </Button>
              </Card>
            </Card>
          </div>
          <DateStrip dates={STRIP_DATES} defaultValue={SAMPLE_DATE} />
          <Field
            label="Pet's name"
            hint="Use the name on your pet's health record."
          >
            <TextInput defaultValue="Luna" />
          </Field>
        </Card>
      </div>
    </>
  );
}
