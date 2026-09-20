import { renderHook, act } from "@testing-library/react";
import { useUnsharePartners } from "./useUnsharePartners";
import { accountManagersApi } from "../services";

jest.mock("../services", () => ({
  accountManagersApi: { unsharePartners: jest.fn() },
}));

const mocked = accountManagersApi.unsharePartners as jest.Mock;

describe("useUnsharePartners", () => {
  beforeEach(() => mocked.mockReset());

  it("posts to the source manager and returns the result", async () => {
    const result = {
      source_manager_id: "a",
      target_manager_id: "b",
      unshared_partners_count: 2,
      unshared_agency_members_count: 1,
      unshared_partner_ids: ["p1", "p2"],
    };
    mocked.mockResolvedValue({ data: result });
    const { result: hook } = renderHook(() => useUnsharePartners());

    let out: unknown;
    await act(async () => {
      out = await hook.current.unsharePartners("a", { target_manager_id: "b" });
    });

    expect(mocked).toHaveBeenCalledWith("a", { target_manager_id: "b" });
    expect(out).toEqual(result);
    expect(hook.current.error).toBeNull();
  });

  it("records the error and rethrows", async () => {
    mocked.mockRejectedValue(new Error("Network Error"));
    const { result: hook } = renderHook(() => useUnsharePartners());

    await act(async () => {
      await expect(hook.current.unsharePartners("a", { target_manager_id: "b" })).rejects.toThrow("Network Error");
    });

    expect(hook.current.error).toBe("Network Error");
  });
});
