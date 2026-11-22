import { Badge } from "@/app/shared/ui/Badge";
import { getNavCounts } from "../_lib/data/dal";
import type { NavCounts } from "../_lib/data/types";

/** Count pill in the sidebar ("128", "18 Today"). Streams in per user. */
export async function NavCountBadge({ kind }: { kind: keyof NavCounts }) {
  const counts = await getNavCounts();
  const value = counts[kind];
  if (!value) return null;

  return kind === "appointmentsToday" ? (
    <Badge size="sm" shape="pill" variant="soft" tone="primary">
      {value} Today
    </Badge>
  ) : (
    <Badge size="sm" shape="pill" variant="soft" tone="neutral">
      {value}
    </Badge>
  );
}
