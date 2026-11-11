import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { SessionContext, type SessionContextValue } from "components/context/SessionContext";
import { mockUser } from "config/mockSession";
import RoleOverview from "../components/RoleOverview";
import api from "lib/useApi";

jest.mock("lib/useApi", () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock("../components/OverviewVisual", () => () => null);
const get = api.get as jest.Mock;

const value: SessionContextValue = {
  status: "ready",
  user: mockUser("account_manager"),
  partner: null,
  isPartnerLoading: false,
  partnerError: null,
  refetchPartner: jest.fn(),
};

test("hides exception cards at zero and has no refresh button", async () => {
  // "On hold" and unread come back as 0; active applications as 12.
  get.mockImplementation((url: string, config: any) =>
    Promise.resolve({
      data: url === "/applications/stages" ? [] : {
        total: config?.params?.status === "hold" || /notification/.test(url) ? 0 : 12,
        items: [],
        count: 0,
      },
    })
  );
  render(
    <SessionContext.Provider value={value}>
      <RoleOverview role="account_manager" />
    </SessionContext.Provider>
  );
  await waitFor(() => expect(screen.getAllByText("12").length).toBeGreaterThan(0));
  expect(screen.queryByText(/on hold/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Quick actions" })).not.toBeInTheDocument();
});
