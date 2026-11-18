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

test("keeps the On hold KPI at zero but hides its empty list, and has no refresh button", async () => {
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
  // On hold comes back as 0 and still shows as a KPI.
  await waitFor(() => expect(screen.getByRole("heading", { name: "Waiting on you" })).toBeInTheDocument());
  await waitFor(() => expect(screen.getAllByText("0").length).toBeGreaterThan(0));
  // KPIs are always there (0 is an answer); an empty list isn't.
  expect(screen.getByRole("heading", { name: "On hold" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Applications on hold" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Quick actions" })).toBeInTheDocument();
});
