import { act, renderHook, waitFor } from "@testing-library/react";
import { useStatement } from "./useStatement";
import { statementApi } from "../services";
import type { WaitingOn } from "../types";
jest.mock("../services", () => ({ statementApi: { list: jest.fn() } }));
it("ignores a stale response after a status change", async () => {
  let resolveOld!: (value: any) => void;
  let resolveNew!: (value: any) => void;
  (statementApi.list as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        })
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNew = resolve;
        })
    );
  const hook = renderHook(
    ({ status }: { status: WaitingOn }) => useStatement({ waiting_on: status }),
    { initialProps: { status: "us" as WaitingOn } }
  );
  hook.rerender({ status: "nobody" });
  await act(async () => {
    resolveNew({ data: { items: [{ reference: "new" }], total: 1 } });
  });
  await waitFor(() =>
    expect(hook.result.current.items[0]?.reference).toBe("new")
  );
  await act(async () => {
    resolveOld({ data: { items: [{ reference: "old" }], total: 1 } });
  });
  expect(hook.result.current.items[0]?.reference).toBe("new");
  expect(hook.result.current.loading).toBe(false);
});
