"use client";

import { useEffect, useState } from "react";
import { startOfDay } from "../utils/date";

/**
 * Today's date, resolved on the client only. Returns null during SSR and
 * hydration so server and browser time zones can't cause a mismatch.
 */
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);
  return today;
}
