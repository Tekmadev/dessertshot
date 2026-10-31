/**
 * Order dates and notice (brief §2.3, §7.3–7.4). The business runs on Toronto
 * time, so "today", the 48-hour notice and Saturday delivery are worked out in
 * America/Toronto on the client and the server alike: a customer in another
 * time zone sees the same answer the server enforces.
 *
 * Dates are civil dates ("YYYY-MM-DD", what <input type="date"> produces).
 * Every function takes `now` so tests can pin the clock.
 */

export const BUSINESS_TIME_ZONE = "America/Toronto";

/** Standard orders need at least this much notice (48 hours); less is "urgent". */
export const STANDARD_NOTICE_DAYS = 2;

/**
 * A 96 needs at least 7 days' notice, and less isn't offered at all (owner,
 * 2026-10-30), unlike smaller packs, where short notice is merely urgent.
 */
export const LARGE_PACK_CUPS = 96;
export const LARGE_PACK_MIN_NOTICE_DAYS = 7;

/**
 * Cups are made the morning of pickup or delivery, so notice is counted to
 * this hour on the chosen date, in whole calendar days: a Saturday 96 is on
 * time until 9 AM the Saturday before, a Saturday 48 until 9 AM on Thursday.
 * The pages say it the same way (content/drafts). How the owner counts notice
 * is still an open question (CONTENT-REVIEW.md, q-d-notice).
 */
export const NOTICE_COUNTED_TO_HOUR = 9;

/**
 * Catches typed-in typos (2062 for 2026), not a booking rule: how far ahead
 * people can book is the owner's call (CONTENT-REVIEW.md, q-d-lead-time).
 */
export const MAX_DAYS_AHEAD = 730;

export type OrderTiming = "past" | "urgent" | "standard" | "too-far" | "too-soon";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parts(date: string): [number, number, number] {
  const m = DATE_RE.exec(date);
  if (!m) throw new Error(`Not a YYYY-MM-DD date: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** "2026-02-30" matches YYYY-MM-DD but isn't a date. */
export function isRealCalendarDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = parts(date);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return utc.getUTCFullYear() === y && utc.getUTCMonth() === m - 1 && utc.getUTCDate() === d;
}

const torontoParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** The wall-clock time in Toronto at `instant`, read back as if it were UTC. */
function torontoWallClockAsUtc(instant: number): number {
  const p = Object.fromEntries(
    torontoParts.formatToParts(new Date(instant)).map((x) => [x.type, x.value])
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
}

/** Today's date in Toronto. */
export function torontoToday(now: Date): string {
  return new Date(torontoWallClockAsUtc(now.getTime())).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The instant it is `hour`:00 in Toronto on `date` (DST-aware). */
export function torontoTimeOn(date: string, hour: number): Date {
  const [y, m, d] = parts(date);
  const wall = Date.UTC(y, m - 1, d, hour);
  // Toronto is behind UTC: shift by the offset, then re-check it at the
  // result in case the guess and the answer straddle a DST change.
  let instant = wall - (torontoWallClockAsUtc(wall) - wall);
  instant = wall - (torontoWallClockAsUtc(instant) - instant);
  return new Date(instant);
}

/** Hours from `now` until the morning the cups are made on `date`. */
export function hoursOfNotice(date: string, now: Date): number {
  return (torontoTimeOn(date, NOTICE_COUNTED_TO_HOUR).getTime() - now.getTime()) / 3_600_000;
}

/**
 * The last moment a request for `date` still has `days` days' notice: 9 AM in
 * Toronto, `days` calendar days before. Calendar days, not 24-hour blocks, so a
 * week that crosses a clock change keeps the deadline the pages state.
 */
export function noticeDeadline(date: string, days: number): Date {
  return torontoTimeOn(addDays(date, -days), NOTICE_COUNTED_TO_HOUR);
}

/** `packCups` brings in the 96's longer minimum ("too-soon"); omit it for the 48-hour rule alone. */
export function orderTiming(date: string, now: Date, packCups?: number): OrderTiming {
  const today = torontoToday(now);
  if (date < today) return "past";
  if (date > addDays(today, MAX_DAYS_AHEAD)) return "too-far";
  const t = now.getTime();
  if (packCups === LARGE_PACK_CUPS && t > noticeDeadline(date, LARGE_PACK_MIN_NOTICE_DAYS).getTime()) return "too-soon";
  return t > noticeDeadline(date, STANDARD_NOTICE_DAYS).getTime() ? "urgent" : "standard";
}

export function isSaturday(date: string): boolean {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 6;
}

/** "Saturday, December 12, 2026" */
export function formatOrderDate(date: string): string {
  const [y, m, d] = parts(date);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
