/** "Alex Rivers" -> "AR", "Luna" -> "LU". */
export function getInitials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, max).toUpperCase();
  return words
    .slice(0, max)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/** ["Luna", "Milo", "Max"] -> "Luna, Milo, and Max" (locale-aware). */
export function formatList(items: string[], locale: string): string {
  return new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(items);
}

/** pluralize(1, "year") -> "1 year"; pluralize(3, "year") -> "3 years". */
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}
