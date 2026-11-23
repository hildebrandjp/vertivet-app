"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sessionMinutes } from "../_lib/schedule";

export function ScheduleRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 30_000);
    return () => clearInterval(interval);
  }, [router]);
  return null;
}

export function SessionTimer({
  startedAt,
  elapsed,
  duration,
}: {
  startedAt?: string;
  elapsed?: number;
  duration?: number;
}) {
  const [minutes, setMinutes] = useState(elapsed);
  useEffect(() => {
    if (!startedAt) {
      setMinutes(elapsed);
      return;
    }
    const refresh = () =>
      setMinutes(sessionMinutes(startedAt, Date.now()) ?? elapsed);
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [startedAt, elapsed]);

  if (minutes === undefined) return null;
  return (
    <span>
      Timer: {minutes}m{duration === undefined ? "" : ` / ${duration}m`}
    </span>
  );
}
