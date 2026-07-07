// The single source of truth for the review-window rule, used everywhere
// this timing logic is needed: application review cycle, the window a
// video-approval hold releases into, and the 7-working-day verification
// review roll-forward. All three follow the identical rule, so it's one
// function, not three copies that could drift out of sync.

/**
 * Given any date, returns the NEXT Tuesday or Friday strictly after it —
 * never the same day, even if the input date IS already a Tuesday/Friday.
 * Tue/Wed/Thu -> the coming Friday. Fri/Sat/Sun/Mon -> the coming Tuesday.
 */
export function nextReviewWindow(from: Date): Date {
  const day = from.getDay(); // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  let daysToAdd: number;

  if (day === 2 || day === 3 || day === 4) {
    // Tue, Wed, Thu -> next Friday
    daysToAdd = 5 - day;
  } else {
    // Fri, Sat, Sun, Mon -> next Tuesday
    const map: Record<number, number> = { 5: 4, 6: 3, 0: 2, 1: 1 };
    daysToAdd = map[day];
  }

  const result = new Date(from);
  result.setDate(result.getDate() + daysToAdd);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Is today one of the two review days? Used to gate the batch job. */
export function isReviewWindowToday(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 2 || day === 5;
}

export function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Adds N working days (skipping Sat/Sun) — used for the 7-day verification review mark. */
export function addWorkingDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

/** Is `date` today or earlier? (date-only comparison, ignores time) */
export function isOnOrBefore(date: Date, reference: Date = new Date()): boolean {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const r = new Date(reference); r.setHours(0, 0, 0, 0);
  return d.getTime() <= r.getTime();
}

/** Formats a date the way the real email templates show deadlines: "Fri, 12 June 2026" */
export function formatDeadline(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
