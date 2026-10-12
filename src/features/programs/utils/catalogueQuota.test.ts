import { CATALOGUE_QUOTA_ERROR_CODE, getCatalogueQuotaError } from "./catalogueQuota";

const quotaError = (details: Record<string, unknown> = {}) => ({
  isAxiosError: true,
  message: "Request failed with status code 429",
  response: {
    status: 429,
    headers: { "content-type": "application/json", "retry-after": "18000" },
    data: {
      code: CATALOGUE_QUOTA_ERROR_CODE,
      message: "Daily catalogue limit reached. It resets at midnight (MYT).",
      details: { metric: "program_detail_views", limit: 300, count: 301, resets_at: "2026-10-11T16:00:00+00:00", ...details },
    },
  },
});

describe("getCatalogueQuotaError", () => {
  it("parses the backend's 429 into metric, limit, count and reset time", () => {
    const quota = getCatalogueQuotaError(quotaError());
    expect(quota).not.toBeNull();
    expect(quota?.metric).toBe("program_detail_views");
    expect(quota?.limit).toBe(300);
    expect(quota?.count).toBe(301);
    expect(quota?.resetsAt?.toISOString()).toBe("2026-10-11T16:00:00.000Z");
    expect(quota?.message).toBe("Daily catalogue limit reached. It resets at midnight (MYT).");
  });

  it("returns null for any other error", () => {
    expect(getCatalogueQuotaError({ isAxiosError: true, response: { status: 429, data: { code: "something_else" } } })).toBeNull();
    expect(getCatalogueQuotaError({ isAxiosError: true, response: { status: 500, data: { detail: "x" } } })).toBeNull();
    expect(getCatalogueQuotaError(new Error("Network Error"))).toBeNull();
    expect(getCatalogueQuotaError(null)).toBeNull();
  });

  it("tolerates missing or malformed details", () => {
    const quota = getCatalogueQuotaError(quotaError({ limit: "lots", count: undefined, resets_at: "not a date" }));
    expect(quota?.limit).toBeNull();
    expect(quota?.count).toBeNull();
    expect(quota?.resetsAt).toBeNull();
  });
});
