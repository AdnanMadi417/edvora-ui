import React from "react";
import { render, screen } from "@testing-library/react";
import VerificationStamp, { VERIFICATION_EXPIRED_NOTE, VERIFICATION_FRESHNESS, formatStampDate, verificationFreshness } from "components/ub/brand/VerificationStamp";

const NOW = new Date(2026, 9, 29); // 29 Oct 2026
const daysAgo = (n: number) => new Date(2026, 9, 29 - n);

describe("verificationFreshness", () => {
  it("keeps the thresholds in one config", () => {
    expect(VERIFICATION_FRESHNESS).toEqual({ freshMaxDays: 90, reviewMaxDays: 180 });
  });

  it.each([
    [0, "fresh"],
    [90, "fresh"],
    [91, "review"],
    [180, "review"],
    [181, "expired"],
    [400, "expired"],
  ])("%i days old is %s", (days, expected) => {
    expect(verificationFreshness(daysAgo(days), NOW)).toBe(expected);
  });

  it("treats future dates as fresh and reads YYYY-MM-DD as a calendar day", () => {
    expect(verificationFreshness("2026-11-05", NOW)).toBe("fresh");
    expect(verificationFreshness("2026-07-31", "2026-10-29")).toBe("fresh"); // 90 days
    expect(verificationFreshness("2026-07-30", "2026-10-29")).toBe("review"); // 91 days
  });
});

describe("VerificationStamp", () => {
  it("formats the date as DD MMM YYYY", () => {
    expect(formatStampDate("2026-06-12")).toBe("12 Jun 2026");
    expect(formatStampDate("2026-03-02")).toBe("02 Mar 2026");
  });

  it("shows the expired note only when expired", () => {
    const { rerender } = render(<VerificationStamp date="2026-09-12" now="2026-10-29" />);
    expect(screen.getByText("12 Sep 2026")).toBeInTheDocument();
    expect(screen.queryByText(VERIFICATION_EXPIRED_NOTE)).not.toBeInTheDocument();

    rerender(<VerificationStamp date="2026-06-12" now="2026-10-29" />);
    expect(screen.getByText("Due for review")).toBeInTheDocument();

    rerender(<VerificationStamp date="2026-03-02" now="2026-10-29" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.getByText(VERIFICATION_EXPIRED_NOTE)).toBeInTheDocument();
  });
});
