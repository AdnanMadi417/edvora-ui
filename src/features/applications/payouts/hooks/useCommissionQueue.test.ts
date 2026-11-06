import { act, renderHook, waitFor } from "@testing-library/react";
import { useCommissionQueue } from "./useCommissionQueue";
import { commissionsApi } from "../services";
import type { WaitingOn } from "../types";
jest.mock("../services", () => ({ commissionsApi: { list: jest.fn() } }));
it("ignores stale finance queue responses after filters change", async () => {
  let old!: (value: any) => void;
  let current!: (value: any) => void;
  (commissionsApi.list as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          old = resolve;
        })
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          current = resolve;
        })
    );
  const hook = renderHook(
    ({ status }: { status: WaitingOn }) =>
      useCommissionQueue({ waiting_on: status }),
    { initialProps: { status: "university" as WaitingOn } }
  );
  hook.rerender({ status: "us" });
  await act(async () => {
    current({ data: { items: [{ reference: "current" }], total: 1 } });
  });
  await waitFor(() =>
    expect(hook.result.current.items[0]?.reference).toBe("current")
  );
  await act(async () => {
    old({ data: { items: [{ reference: "stale" }], total: 1 } });
  });
  expect(hook.result.current.items[0]?.reference).toBe("current");
  expect(hook.result.current.loading).toBe(false);
});
