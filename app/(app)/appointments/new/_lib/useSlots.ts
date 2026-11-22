"use client";

import { useEffect, useState } from "react";
import type { TimeSlot } from "../../../_lib/data/types";
import { loadSlots } from "../actions";

export type SlotsView =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slots: TimeSlot[] };

/**
 * Availability for one service on one day. Results are kept in `cache`
 * (owned by the wizard) so revisiting a day is instant; responses for a
 * day the user has already left are ignored.
 */
export function useSlots(
  serviceId: string,
  date: string | null,
  cache: Map<string, TimeSlot[]>,
): [SlotsView, () => void] {
  const [results, setResults] = useState<Record<string, SlotsView>>({});
  const [attempt, setAttempt] = useState(0);
  const key = date ? `${serviceId}|${date}` : null;
  // Changes on retry, so the effect runs again for the same key.
  const requestId = key ? `${key}#${attempt}` : null;

  useEffect(() => {
    if (!requestId || !date) return;
    const cacheKey = `${serviceId}|${date}`;
    if (cache.has(cacheKey)) return;
    let cancelled = false;
    loadSlots(serviceId, date).then((result) => {
      if (cancelled) return;
      if (result.ok) cache.set(cacheKey, result.slots);
      setResults((all) => ({
        ...all,
        [cacheKey]: result.ok
          ? { status: "ready", slots: result.slots }
          : { status: "error", message: result.message },
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [requestId, cache, date, serviceId]);

  if (!key) return [{ status: "idle" }, () => {}];
  const cached = cache.get(key);
  const view: SlotsView = cached
    ? { status: "ready", slots: cached }
    : (results[key] ?? { status: "loading" });
  const retry = () => {
    setResults((all) => ({ ...all, [key]: { status: "loading" } }));
    setAttempt((n) => n + 1);
  };
  return [view, retry];
}
