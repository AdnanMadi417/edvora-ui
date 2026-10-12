import { renderHook, waitFor } from "@testing-library/react";
import { useProgram } from "./useProgram";
import { programApi } from "../services";

jest.mock("../services", () => ({
  programApi: { programs: { get: jest.fn() } },
}));

const mockedGet = programApi.programs.get as jest.Mock;

const quotaError = () => ({
  isAxiosError: true,
  message: "Request failed with status code 429",
  response: {
    status: 429,
    headers: { "content-type": "application/json" },
    data: {
      code: "catalogue_quota_exceeded",
      message: "Daily catalogue limit reached. It resets at midnight (MYT).",
      details: { metric: "program_detail_views", limit: 300, count: 301, resets_at: "2026-10-11T16:00:00+00:00" },
    },
  },
});

describe("useProgram", () => {
  beforeEach(() => mockedGet.mockReset());

  it("exposes the quota when the backend refuses the read", async () => {
    mockedGet.mockRejectedValue(quotaError());
    const { result } = renderHook(() => useProgram("prog-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.quota?.metric).toBe("program_detail_views");
    expect(result.current.quota?.limit).toBe(300);
    expect(result.current.error).toBe("Daily catalogue limit reached. It resets at midnight (MYT).");
    expect(result.current.program).toBeNull();
  });

  it("keeps the generic error for any other failure", async () => {
    mockedGet.mockRejectedValue(Object.assign(new Error("boom"), { isAxiosError: true, response: { status: 500, data: { detail: "x" } } }));
    const { result } = renderHook(() => useProgram("prog-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.quota).toBeNull();
    expect(result.current.error).toBe("Failed to fetch program");
  });

  it("clears a previous quota on refetch", async () => {
    mockedGet.mockRejectedValueOnce(quotaError()).mockResolvedValueOnce({ data: { program: { id: "prog-1", name: "MBA" } } });
    const { result } = renderHook(() => useProgram("prog-1"));
    await waitFor(() => expect(result.current.quota).not.toBeNull());
    await result.current.refetch();
    await waitFor(() => expect(result.current.quota).toBeNull());
    expect(result.current.program?.name).toBe("MBA");
    expect(result.current.error).toBeNull();
  });
});
