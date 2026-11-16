import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditUniversityDetails from "./EditUniversityDetails";
import { emptyConfiguration } from "features/universities/language-centers/configuration";
import {
  readCentreConfiguration,
  saveCentreConfiguration,
} from "features/universities/language-centers/hooks/useCentreConfiguration";

const mockUpdate = jest.fn().mockResolvedValue({});
const mockUniversity = {
  id: "uni-1",
  name: "Example University",
  country: "Malaysia",
  university_type_id: "private",
  is_active: true,
  has_language_center: false,
  is_public: false,
  is_hidden: false,
  intake_months: [],
};
const mockBranches = [
  {
    id: "branch",
    name: "Main Campus",
    location: "Kuala Lumpur",
    state_id: "1",
  },
];
const mockPayments = [];
jest.mock("features/universities/hooks", () => ({
  useUniversityDetails: () => ({
    university: mockUniversity,
    branches: mockBranches,
    universityLoading: false,
    refetch: jest.fn(),
  }),
  useUniversityPaymentMethods: () => ({
    universityPaymentMethods: mockPayments,
    refetch: jest.fn(),
  }),
  useAssignUniversityType: () => ({ assignUniversityType: jest.fn() }),
  useUniversityTypes: () => ({
    universities: [{ id: "private", name: "Private" }],
  }),
  useUpdateUniversityPaymentMethod: () => ({}),
  useAssignUniversityPaymentMethod: () => ({}),
  useDeleteUniversityPaymentMethod: () => ({}),
  useDeleteBranch: () => ({}),
  useUpdateUniversity: () => ({
    updateUniversity: mockUpdate,
    updateLoading: false,
  }),
}));
jest.mock("features/knowledge-hub/payment-methods/hooks", () => ({
  useAllPaymentMethods: () => ({ paymentMethods: [] }),
}));
jest.mock("features/programs/hooks", () => ({
  useStates: () => ({ states: [{ id: "1", name: "Selangor" }] }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/forms/text/RichTextEditor", () => ({
  __esModule: true,
  default: () => <div>Description editor</div>,
}));
beforeEach(() => {
  localStorage.clear();
  mockUpdate.mockClear();
});
it("loads the saved centre and enables saving changes made only to its configuration", async () => {
  saveCentreConfiguration("uni-1", {
    ...emptyConfiguration(),
    enabled: true,
    name: "English Academy",
  });
  const user = userEvent.setup();
  render(<EditUniversityDetails id="uni-1" />);
  expect(
    await screen.findByRole("textbox", { name: /^Centre name/ })
  ).toHaveValue("English Academy");
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await user.type(
    screen.getByRole("textbox", { name: /^Centre name/ }),
    " Updated"
  );
  expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(readCentreConfiguration("uni-1")?.name).toBe(
      "English Academy Updated"
    )
  );
  expect(mockUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ has_language_center: true })
  );
  expect(mockUpdate.mock.calls[0][0]).not.toHaveProperty("courses");
});
