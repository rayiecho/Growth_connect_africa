/**
 * Date utilities for the review-batch windows (Tue/Fri invite timing,
 * deadline arithmetic). Moved here from lib/engine/dates.ts so the data
 * layer is self-contained.
 */

/**
 * Returns the next review-window date for an applicant's submission:
 *   - Tue/Wed/Thu applications  → Friday of the same week (or next if Tue = today)
 *   - Fri/Sat/Sun/Mon applications → Tuesday of the following week
 *
 * Tuesday = 2, Friday = 5.
 */
export function nextReviewWindow(applied: Date): Date {
  const day = applied.getDay();
  const result = new Date(applied);
  result.setHours(0, 0, 0, 0);

  if (day >= 3 && day <= 5) {
    // Wed/Thu/Fri → next Friday
    result.setDate(result.getDate() + (5 - day));
  } else if (day === 6) {
    // Sat → next Tuesday (3 days)
    result.setDate(result.getDate() + 3);
  } else if (day === 0) {
    // Sun → next Tuesday (2 days)
    result.setDate(result.getDate() + 2);
  } else if (day === 1) {
    // Mon → next Tuesday (1 day)
    result.setDate(result.getDate() + 1);
  } else {
    // Tue → next Friday (3 days) — Tue app goes Fri, NOT the same Tue
    result.setDate(result.getDate() + 3);
  }
  return result;
}

/** Adds N calendar days to a Date, returning a new Date. */
export function addCalendarDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** True if `a` is on or before `b` (date-only). */
export function isOnOrBefore(a: Date, b: Date): boolean {
  const aDay = new Date(a);
  aDay.setHours(0, 0, 0, 0);
  const bDay = new Date(b);
  bDay.setHours(0, 0, 0, 0);
  return aDay.getTime() <= bDay.getTime();
}

/** "Tuesday, 5 August 2025" for the email deadline text. */
export function formatDeadline(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
