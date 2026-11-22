import Image from "next/image";
import { cx } from "../utils/cx";
import { getInitials } from "../utils/text";
import styles from "./Avatar.module.css";

const PIXELS = { sm: 32, md: 40, lg: 48, xl: 64 } as const;

export interface AvatarProps {
  /** Person or pet name: used for the alt text and the initials fallback. */
  name: string;
  /** Photo URL. Falls back to initials when missing. */
  src?: string | null;
  size?: keyof typeof PIXELS;
  /** circle for people, rounded square for pets/photos. */
  shape?: "circle" | "rounded";
  /** Decorative when the name is already printed next to it. */
  decorative?: boolean;
  className?: string;
}

/** Photo or initials in a fixed-size frame. Images are lazy-loaded. */
export function Avatar({
  name,
  src,
  size = "md",
  shape = "circle",
  decorative = false,
  className,
}: AvatarProps) {
  const pixels = PIXELS[size];
  const common = {
    className: cx(styles.avatar, className),
    "data-size": size,
    "data-shape": shape,
  };

  if (src) {
    return (
      <span {...common}>
        <Image
          src={src}
          alt={decorative ? "" : name}
          width={pixels}
          height={pixels}
          sizes={`${pixels}px`}
          className={styles.image}
        />
      </span>
    );
  }

  const initials = getInitials(name);
  return decorative ? (
    <span {...common} aria-hidden="true">
      {initials}
    </span>
  ) : (
    <span {...common} role="img" aria-label={name}>
      {initials}
    </span>
  );
}
