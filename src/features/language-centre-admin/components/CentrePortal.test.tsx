import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SessionContext,
  type SessionContextValue,
} from "components/context/SessionContext";
import CentreAccessBoundary from "./CentreAccessBoundary";
import CentreEditor from "./CentreEditor";
import CentreOverview from "./CentreOverview";
import CentreAdminUsers from "./CentreAdminUsers";
import {
  readWorkspace,
  updateCentreAdmin,
  WORKSPACE_KEY,
  WORKSPACE_EVENT,
} from "../services/centreWorkspace";
import { selectOption } from "testUtils/selectOption";
import routes from "routes/languageCentreAdminRoutes";
import { rowAction } from "testUtils/rowActions";
const platform = { id: "admin", role: "admin" };
const actor = {
  id: "mock-language_centre_admin",
  role: "language_centre_admin",
};
function session(role = actor.role, id = actor.id): SessionContextValue {
  return {
    status: "ready",
    user: { id, role, name: "Demo User", email: "demo@example.com" },
    partner: null,
    isPartnerLoading: false,
    partnerError: null,
    refetchPartner: jest.fn(),
  };
}
function portal(child: React.ReactNode, value = session()) {
  return render(
    <SessionContext.Provider value={value}>
      <CentreAccessBoundary>{child}</CentreAccessBoundary>
    </SessionContext.Provider>
  );
}
jest.mock("features/universities/hooks/institutions/useUniversities", () => ({
  useUniversities: () => ({
    universities: [{ id: "uni_001", name: "APU" }],
    loading: false,
    error: null,
  }),
}));
beforeEach(() => localStorage.clear());
it("shows only the assigned centre dashboard and four permitted routes", async () => {
  portal(<CentreOverview />);
  await screen.findByText("Manage your language centre, branches and courses.");
  expect(
    screen.getByRole("heading", { name: "Your courses" })
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole("heading", { name: "Upcoming intakes" })[0]
  ).toBeInTheDocument();
  expect(routes.map((route) => route.name)).toEqual([
    "Overview",
    "Centre Profile",
    "Branches",
    "Courses",
  ]);
  expect(
    screen.queryByText("Horizon Language Academy")
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", {
      name: /university|commission|application|settings/i,
    })
  ).not.toBeInTheDocument();
});
it("saves profile edits without allowing centre type or university changes", async () => {
  const user = userEvent.setup();
  portal(<CentreEditor section="profile" />);
  const name = await screen.findByRole("textbox", { name: /^Centre name/ });
  await user.clear(name);
  await user.type(name, "Updated language academy");
  expect(
    screen.queryByRole("combobox", { name: "Centre type" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "University" })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Centre information saved"
  );
  expect(
    readWorkspace().centres.find((centre) => centre.id === "lc_001")
      ?.configuration.name
  ).toBe("Updated language academy");
  expect(
    readWorkspace().centres.find((centre) => centre.id === "lc_002")
      ?.configuration.name
  ).not.toBe("Updated language academy");
});
it("validates branch fields and saves branches within the assigned centre", async () => {
  const user = userEvent.setup();
  portal(<CentreEditor section="branches" />);
  await user.click(await screen.findByRole("button", { name: "Add branch" }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(
    screen.getByText("Enter the branch name and location.")
  ).toBeInTheDocument();
  await user.type(
    screen.getAllByRole("textbox", { name: /^Branch name/ })[1],
    "City branch"
  );
  await user.type(
    screen.getAllByRole("textbox", { name: /^Location/ })[1],
    "Kuala Lumpur"
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Centre information saved.");
  expect(readWorkspace().centres[0].branches).toHaveLength(2);
});
it("blocks the entire portal after an admin suspends the account", async () => {
  portal(<CentreOverview />);
  await screen.findByText("Manage your language centre, branches and courses.");
  act(() => {
    updateCentreAdmin(platform, actor.id, { status: "suspended" });
  });
  await screen.findByText("Centre access unavailable");
  expect(
    screen.queryByRole("heading", { name: "Your courses" })
  ).not.toBeInTheDocument();
});
it("fails closed for unassigned users and recovers from a storage read failure", async () => {
  const { unmount } = portal(
    <CentreOverview />,
    session(actor.role, "unassigned")
  );
  await screen.findByText("Centre access unavailable");
  unmount();
  localStorage.setItem(WORKSPACE_KEY, "bad json");
  const user = userEvent.setup();
  portal(<CentreOverview />);
  await screen.findByText("Unable to load your centre");
  localStorage.removeItem(WORKSPACE_KEY);
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("Manage your language centre, branches and courses.");
});
it("lets platform admins invite and activate an assigned user", async () => {
  const user = userEvent.setup();
  render(
    <SessionContext.Provider value={session("admin", "admin")}>
      <CentreAdminUsers />
    </SessionContext.Provider>
  );
  await user.click(
    await screen.findByRole("button", { name: "Invite centre admin" })
  );
  await user.type(
    screen.getByRole("textbox", { name: /^Name/ }),
    "New Centre Staff"
  );
  await user.type(
    screen.getByRole("textbox", { name: /^Email/ }),
    "new.staff@example.com"
  );
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /^Assigned centre/ }),
    "independent_001"
  );
  await user.click(screen.getByRole("button", { name: "Save invitation" }));
  await waitFor(() =>
    expect(
      readWorkspace().users.some(
        (member) =>
          member.email === "new.staff@example.com" &&
          member.status === "invited"
      )
    ).toBe(true)
  );
  await user.click(rowAction("Activate demo account"));
  expect(
    readWorkspace().users.find(
      (member) => member.email === "new.staff@example.com"
    )?.status
  ).toBe("active");
});
it("denies account management to centre administrators", () => {
  render(
    <SessionContext.Provider value={session()}>
      <CentreAdminUsers />
    </SessionContext.Provider>
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Only Unibexs Admins");
  expect(
    screen.queryByRole("button", { name: "Invite centre admin" })
  ).not.toBeInTheDocument();
});

// Long form flow; the default 5s isn't enough while the full suite runs in parallel.
it("saves course and intake edits without stripping centre-admin fields", async () => {
  const user = userEvent.setup();
  portal(<CentreEditor section="courses" />);
  const names = await screen.findAllByRole("textbox", { name: /^Course name/ });
  await user.clear(names[0]);
  await user.type(names[0], "Centre-owned English");
  fireEvent.change(screen.getAllByLabelText(/^Start date/)[0], {
    target: { value: "2027-08-16" },
  });
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Centre information saved.");
  const course = readWorkspace().centres[0].configuration.courses[0];
  expect(course.name).toBe("Centre-owned English");
  expect(course.intakes[0].date).toBe("2027-08-16");
}, 20_000);
