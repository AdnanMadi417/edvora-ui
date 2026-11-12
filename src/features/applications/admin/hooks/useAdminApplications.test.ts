import { renderHook, act, waitFor } from "@testing-library/react";
import api from "lib/useApi";
import { useAdminApplications } from "./useAdminApplications";

jest.mock("lib/useApi", () => ({ __esModule: true, default: { get: jest.fn() } }));
const get = api.get as jest.Mock;

it("keeps the newest result when an older request answers last", async () => {
  const resolvers: Array<(value: unknown) => void> = [];
  get.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));
  const { result, rerender } = renderHook(({ limit }) => useAdminApplications({ limit }), {
    initialProps: { limit: 20 },
  });
  rerender({ limit: 10 }); // e.g. the screen became a phone
  await waitFor(() => expect(resolvers).toHaveLength(2));
  // The newer request (limit 10) answers first, the older one (limit 20) last.
  await act(async () => resolvers[1]({ data: { items: Array(10).fill({}), total: 21, limit: 10, offset: 0 } }));
  await act(async () => resolvers[0]({ data: { items: Array(20).fill({}), total: 21, limit: 20, offset: 0 } }));
  expect(result.current.items).toHaveLength(10);
  expect(result.current.loading).toBe(false);
});
