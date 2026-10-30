import { describe, expect, it } from "vitest";
import {
  addDays,
  formatOrderDate,
  hoursOfNotice,
  isRealCalendarDate,
  isSaturday,
  orderTiming,
  torontoTimeOn,
  torontoToday,
} from "./order-timing";

// Friday 30 Oct 2026, 08:00 in Toronto (EDT, UTC−4).
const NOW = new Date("2026-10-30T12:00:00Z");

describe("Toronto dates", () => {
  it("works out today's date in Toronto, not UTC", () => {
    expect(torontoToday(NOW)).toBe("2026-10-30");
    // 23:30 on the 30th in Toronto is already the 31st in UTC.
    expect(torontoToday(new Date("2026-10-31T03:30:00Z"))).toBe("2026-10-30");
  });

  it("finds 9 AM in Toronto on either side of a DST change", () => {
    expect(torontoTimeOn("2026-10-31", 9).toISOString()).toBe("2026-10-31T13:00:00.000Z"); // EDT
    expect(torontoTimeOn("2026-11-01", 9).toISOString()).toBe("2026-11-01T14:00:00.000Z"); // EST, the day DST ends
    expect(torontoTimeOn("2027-03-14", 9).toISOString()).toBe("2027-03-14T13:00:00.000Z"); // EDT, the day DST starts
  });

  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("recognises real calendar dates only", () => {
    expect(isRealCalendarDate("2028-02-29")).toBe(true);
    expect(isRealCalendarDate("2026-02-29")).toBe(false);
    expect(isRealCalendarDate("2026-13-01")).toBe(false);
    expect(isRealCalendarDate("next saturday")).toBe(false);
  });

  it("knows Saturdays and formats dates for people", () => {
    expect(isSaturday("2026-12-12")).toBe(true);
    expect(isSaturday("2026-12-11")).toBe(false);
    expect(formatOrderDate("2026-12-12")).toBe("Saturday, December 12, 2026");
  });
});

describe("orderTiming (48 hours' notice, brief §7.4)", () => {
  it("rejects past dates and allows today as urgent", () => {
    expect(orderTiming("2026-10-29", NOW)).toBe("past");
    expect(orderTiming("2026-10-30", NOW)).toBe("urgent");
  });

  it("counts the notice to the morning the cups are made", () => {
    expect(hoursOfNotice("2026-10-31", NOW)).toBe(25);
    expect(orderTiming("2026-10-31", NOW)).toBe("urgent");
    // 50 hours, because the clocks go back an hour on 1 Nov.
    expect(hoursOfNotice("2026-11-01", NOW)).toBe(50);
    expect(orderTiming("2026-11-01", NOW)).toBe("standard");
  });

  it("treats exactly 48 hours as standard and a minute less as urgent", () => {
    const at48 = new Date("2026-12-10T14:00:00Z"); // 09:00 EST, two days before 12 Dec
    expect(orderTiming("2026-12-12", at48)).toBe("standard");
    expect(orderTiming("2026-12-12", new Date(at48.getTime() + 60_000))).toBe("urgent");
  });

  it("flags dates more than two years out as likely typos", () => {
    expect(orderTiming(addDays("2026-10-30", 730), NOW)).toBe("standard");
    expect(orderTiming(addDays("2026-10-30", 731), NOW)).toBe("too-far");
  });
});
