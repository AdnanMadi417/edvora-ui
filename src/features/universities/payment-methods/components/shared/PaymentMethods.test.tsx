import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentMethodsDirectory from "./PaymentMethodsDirectory";
import CreatePayment from "../admin/popups/CreatePayment";
import EditPaymentMethodDetails from "../admin/EditPaymentMethodDetails";
import { rowAction, queryRowAction } from "testUtils/rowActions";
const mockDelete = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockPush = jest.fn();
const mockRefetch = jest.fn();
jest.mock("../../hooks", () => ({
  useAllPaymentMethods: () => ({
    paymentMethods: [
      {
        id: "bank",
        name: "Bank transfer",
        description: "<p>Transfer to the university bank account.</p>",
      },
      { id: "card", name: "Credit card", description: "" },
    ],
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useDeletePaymentMethod: () => ({
    deletePayment: mockDelete,
    isDeleting: false,
  }),
  useCreatePayment: () => ({
    createPayment: mockCreate,
    paymentLoading: false,
  }),
  useUpdatePaymentMethods: () => ({
    updatePaymentMethods: mockUpdate,
    loading: false,
  }),
  usePaymentMethod: () => ({
    paymentMethod: {
      id: "bank",
      name: "Bank transfer",
      description: "<p>Original description.</p>",
    },
    loading: false,
    error: null,
  }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/forms/text/RichTextEditor", () => ({
  __esModule: true,
  default: ({ formData, updateFormData }: any) => (
    <textarea
      aria-label="Description"
      value={formData.description}
      onChange={(e) => updateFormData("description", e.target.value)}
    />
  ),
}));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  jest.clearAllMocks();
  mockDelete.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue({});
  mockUpdate.mockResolvedValue({});
});
it("requires explicit delete confirmation", async () => {
  const user = userEvent.setup();
  render(<PaymentMethodsDirectory />);
  await user.click(rowAction("Delete Credit card"));
  expect(mockDelete).not.toHaveBeenCalled();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Delete payment method" })
    ).getByRole("button", { name: "Delete payment method" })
  );
  expect(mockDelete).toHaveBeenCalledWith("card");
  await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
});
it("uses data-entry details and edit routes without deletion", () => {
  render(
    <PaymentMethodsDirectory
      basePath="/data-entry/payment-methods"
      allowDelete={false}
    />
  );
  expect(
    rowAction("View Credit card")
  ).toHaveAttribute("href", "/data-entry/payment-methods/card");
  expect(
    screen.getByRole("link", { name: "Edit Credit card" })
  ).toHaveAttribute("href", "/data-entry/payment-methods/card/edit");
  expect(
    queryRowAction("Delete Credit card")
  ).not.toBeInTheDocument();
});
it("creates a method with a trimmed name and refreshes immediately", async () => {
  const user = userEvent.setup();
  const close = jest.fn();
  const refresh = jest.fn();
  render(<CreatePayment isOpen onClose={close} onSuccess={refresh} />);
  await user.type(
    screen.getByRole("textbox", { name: "Payment method name" }),
    "  Bank transfer  "
  );
  await user.click(
    screen.getByRole("button", { name: "Create payment method" })
  );
  expect(mockCreate).toHaveBeenCalledWith({
    name: "Bank transfer",
    description: "",
  });
  expect(close).toHaveBeenCalled();
  expect(refresh).toHaveBeenCalled();
});
it("updates rich-text content through the existing payload contract", async () => {
  const user = userEvent.setup();
  render(<EditPaymentMethodDetails id="bank" />);
  const name = screen.getByRole("textbox", { name: "Payment method name" });
  await user.clear(name);
  await user.type(name, "Updated transfer");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(mockUpdate).toHaveBeenCalledWith("bank", {
    name: "Updated transfer",
    description: "<p>Original description.</p>",
  });
  expect(mockPush).toHaveBeenCalledWith(
    "/admin/config-universities/payment-methods/bank"
  );
});
