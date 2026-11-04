import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateBranch from "./CreateBranch";
import CreateUniversityType from "./CreateUniversityType";

const mockCreateBranch = jest.fn();
const mockCreateType = jest.fn();
const mockLoading = { branch: false };
jest.mock("features/universities/hooks", () => ({
  useCreateBranch: () => ({
    createBranch: mockCreateBranch,
    branchLoading: mockLoading.branch,
  }),
  useCreateUniversityType: () => ({
    createUniversityType: mockCreateType,
    loading: false,
  }),
}));
jest.mock("features/programs/hooks/configuration/useStates", () => ({
  useStates: () => ({ states: [{ id: "state-1", name: "Selangor" }] }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoading.branch = false;
});

it("submits a complete branch using the existing institution ID and payload", async () => {
  mockCreateBranch.mockResolvedValue({ id: "branch-1" });
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  render(
    <CreateBranch
      isOpen
      onClose={onClose}
      onSuccess={onSuccess}
      universityId="uni-1"
    />
  );
  const dialog = await screen.findByRole("dialog", { name: "Create branch" });
  expect(
    within(dialog).getByRole("button", { name: "Create branch" })
  ).toBeDisabled();
  await userEvent.type(
    within(dialog).getByRole("textbox", { name: "Branch Name" }),
    "Main Campus"
  );
  await userEvent.type(
    within(dialog).getByRole("textbox", { name: "Location" }),
    "Shah Alam"
  );
  await userEvent.selectOptions(
    within(dialog).getByRole("combobox", { name: "State" }),
    "state-1"
  );
  await userEvent.click(
    within(dialog).getByRole("button", { name: "Create branch" })
  );
  expect(mockCreateBranch).toHaveBeenCalledWith("uni-1", {
    name: "Main Campus",
    location: "Shah Alam",
    state_id: "state-1",
  });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

it("locks the branch fields and prevents closing while saving", async () => {
  mockLoading.branch = true;
  const onClose = jest.fn();
  render(<CreateBranch isOpen onClose={onClose} universityId="uni-1" />);
  const dialog = await screen.findByRole("dialog", { name: "Create branch" });
  expect(
    within(dialog).getByRole("textbox", { name: "Branch Name" })
  ).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
  await userEvent.click(
    within(dialog).getByRole("button", { name: "Close dialog" })
  );
  await userEvent.keyboard("{Escape}");
  expect(onClose).not.toHaveBeenCalled();
});

it("retains university-type validation and submits the multiline description", async () => {
  mockCreateType.mockResolvedValue(undefined);
  const onSuccess = jest.fn();
  render(
    <CreateUniversityType isOpen onClose={jest.fn()} onSuccess={onSuccess} />
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Create university type",
  });
  const name = within(dialog).getByRole("textbox", {
    name: "University type name",
  });
  const description = within(dialog).getByRole("textbox", {
    name: "Description",
  });
  expect(description.tagName).toBe("TEXTAREA");
  await userEvent.type(name, " Public university ");
  await userEvent.type(description, "Short");
  expect(
    within(dialog).getByRole("button", { name: "Create university type" })
  ).toBeDisabled();
  await userEvent.clear(description);
  await userEvent.type(description, " Government funded institutions. ");
  await userEvent.click(
    within(dialog).getByRole("button", { name: "Create university type" })
  );
  expect(mockCreateType).toHaveBeenCalledWith({
    name: "Public university",
    description: "Government funded institutions.",
  });
  expect(onSuccess).toHaveBeenCalledTimes(1);
});
