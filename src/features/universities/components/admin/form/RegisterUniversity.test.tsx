import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterUniversity from "./RegisterUniversity";

const mockCreate = jest.fn();
jest.mock("features/universities/hooks", () => ({
  useCreateUniversity: () => ({ createUniversity: mockCreate, loading: false }),
  useUniversityTypes: () => ({
    universities: [{ id: "type-1", name: "Public university" }],
  }),
}));
jest.mock("features/programs/hooks", () => ({
  useStates: () => ({ states: [{ id: "state-1", name: "Selangor" }] }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/forms/uploads/ImageUploadField", () => ({
  __esModule: true,
  default: () => <p>University logo</p>,
}));

it("validates and preserves university details across steps, then submits the complete payload", async () => {
  mockCreate.mockResolvedValue(undefined);
  render(<RegisterUniversity />);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("University name is required")).toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "Branch Name" })
  ).not.toBeInTheDocument();
  await userEvent.type(
    screen.getByRole("textbox", { name: "University Name" }),
    "Sunway University"
  );
  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: "University Type" }),
    "type-1"
  );
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Jan" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Branch name is required")).toBeInTheDocument();
  await userEvent.type(
    screen.getByRole("textbox", { name: "Branch Name" }),
    "Main Campus"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Location" }),
    "Petaling Jaya"
  );
  await userEvent.click(screen.getByRole("combobox", { name: "State" }));
  await userEvent.click(screen.getByRole("option", { name: "Selangor" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Sunway University")).toBeInTheDocument();
  expect(screen.getByText("January")).toBeInTheDocument();
  expect(mockCreate).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("textbox", { name: "Branch Name" })).toHaveValue(
    "Main Campus"
  );
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(
    screen.getByRole("button", { name: "Create university" })
  );
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Sunway University",
      university_type_id: "type-1",
      intake_months: [1],
      branches: [
        { name: "Main Campus", location: "Petaling Jaya", state_id: "state-1" },
      ],
    })
  );
});
