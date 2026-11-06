import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateUniversityType from "./CreateUniversityType";

const mockCreateType = jest.fn();
jest.mock("features/universities/configuration/hooks", () => ({ useCreateUniversityType: () => ({ createUniversityType: mockCreateType, loading: false }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
beforeEach(() => { jest.clearAllMocks(); });

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
