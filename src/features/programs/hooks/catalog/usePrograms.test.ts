import { renderHook, waitFor } from "@testing-library/react";
import { usePrograms } from "./usePrograms";
import { programApi } from "../../services";

jest.mock("../../services", () => ({
  programApi: { programs: { list: jest.fn() } },
}));

const mockedList = programApi.programs.list as jest.Mock;

describe("usePrograms", () => {
  beforeEach(() => mockedList.mockReset());

  it("exposes the quota when the partner's list budget is used up", async () => {
    mockedList.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 429,
        data: { code: "catalogue_quota_exceeded", message: "Daily catalogue limit reached.", details: { metric: "program_list_rows", limit: 5000, count: 5000, resets_at: "2026-10-11T16:00:00+00:00" } },
      },
    });
    const { result } = renderHook(() => usePrograms({ search: "mba" }));
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.quota?.metric).toBe("program_list_rows");
    expect(result.current.programs).toEqual([]);
  });

  it("returns the list and no quota on success", async () => {
    mockedList.mockResolvedValue({ data: { items: [{ id: "p1" }], total: 1 } });
    const { result } = renderHook(() => usePrograms());
    await waitFor(() => expect(result.current.programs).toHaveLength(1));
    expect(result.current.quota).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
