import { renderHook, act } from "@testing-library/react";
import { useTransferPartners } from "./useTransferPartners";
import { accountManagersApi } from "../services";

jest.mock("../services", () => ({
  accountManagersApi: { transferPartners: jest.fn() },
}));

const mockedTransfer = accountManagersApi.transferPartners as jest.Mock;

const RESULT = {
  source_manager_id: "manager-a",
  target_manager_id: "manager-b",
  moved_partners_count: 3,
  moved_agency_members_count: 2,
  moved_partner_ids: ["p1", "p2", "p3"],
};

describe("useTransferPartners", () => {
  beforeEach(() => mockedTransfer.mockReset());

  it("posts mode=move to the source manager and returns the result", async () => {
    mockedTransfer.mockResolvedValue({ data: RESULT });
    const { result } = renderHook(() => useTransferPartners());

    let out: unknown;
    await act(async () => {
      out = await result.current.transferPartners("manager-a", { target_manager_id: "manager-b" });
    });

    expect(mockedTransfer).toHaveBeenCalledWith("manager-a", {
      mode: "move",
      target_manager_id: "manager-b",
    });
    expect(out).toEqual(RESULT);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("forwards a partner subset untouched", async () => {
    mockedTransfer.mockResolvedValue({ data: { ...RESULT, moved_partners_count: 1 } });
    const { result } = renderHook(() => useTransferPartners());

    await act(async () => {
      await result.current.transferPartners("manager-a", {
        target_manager_id: "manager-b",
        partner_ids: ["p1"],
      });
    });

    expect(mockedTransfer).toHaveBeenCalledWith("manager-a", {
      mode: "move",
      target_manager_id: "manager-b",
      partner_ids: ["p1"],
    });
  });

  it("records the error message and rethrows so callers can branch on the code", async () => {
    mockedTransfer.mockRejectedValue(new Error("Network Error"));
    const { result } = renderHook(() => useTransferPartners());

    await act(async () => {
      await expect(
        result.current.transferPartners("manager-a", { target_manager_id: "manager-b" })
      ).rejects.toThrow("Network Error");
    });

    expect(result.current.error).toBe("Network Error");
    expect(result.current.loading).toBe(false);
  });
});
