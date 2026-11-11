import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProgramEditForm from "./ProgramEditForm";

// jest.mock paths are not rewritten by the tsconfig baseUrl, so they are relative.
const mockUpdateProgram = jest.fn();
const mockShowToast = jest.fn();
let mockProgram: any;
let mockCommission: any;

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock("components/ub/forms/text/RichTextEditor", () => () => null);
jest.mock("../../shared/form/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: () => {},
  confirmDiscard: (_dirty: boolean, go: () => void) => go(),
}));
jest.mock("../../../hooks", () => ({
  useProgram: () => ({ program: mockProgram, commission: mockCommission }),
  useUpdateProgram: () => ({ updateProgram: mockUpdateProgram, updateProgrLoading: false }),
  useDeletePrograms: () => ({ deletePrograms: jest.fn() }),
}));
jest.mock("../../../../knowledge-hub/commission/hooks", () => ({
  useCommissionTypes: () => ({
    commissionTypes: [
      { id: "type-first", name: "One time per year" },
      { id: "type-percentage", name: "Percentage" },
    ],
  }),
}));
jest.mock("../../../../universities/hooks", () => ({
  useUniversities: () => ({ universities: [{ id: "uni-1", name: "Test Uni" }] }),
  useBranches: () => ({ branches: [{ id: "branch-1", name: "Main", uni_id: "uni-1" }] }),
}));
jest.mock("../../../../knowledge-hub/field-of-study/hooks", () => ({
  useAllFields: () => ({ fields: [{ id: "fos-1", name: "Computing" }] }),
}));
jest.mock("../../../../knowledge-hub/qualifications/hooks", () => ({
  useAllQualifications: () => ({ qualifications: [{ id: "qual-1", name: "Bachelor" }] }),
}));
jest.mock("./validateProgram", () => ({ validateProgram: () => ({ isValid: true, errors: {} }) }));

const UPDATED_AT = "2026-09-30T08:15:42.123456+00:00";

beforeEach(() => {
  mockUpdateProgram.mockReset().mockResolvedValue({});
  mockShowToast.mockReset();
  mockProgram = {
    id: "prog-1",
    name: "BSc Computing",
    university: { id: "uni-1", name: "Test Uni" },
    branch: { id: "branch-1" },
    field_of_study: { id: "fos-1" },
    tuition_fee: 10000,
    intake_months: [1, 9],
    duration: 3,
    english_required_score: "6",
    overview: "",
    curriculum: "",
    is_on_campus: true,
    is_online: false,
    has_scholarship: false,
    scholarships: [],
    commission_amount: 10,
    commission_currency: "RM",
    qualification_id: "qual-1",
    course_type: null,
    yearly_fee_currency: "MYR",
    yearly_fees: [{ year: 1, fee: 5000 }],
    one_time_fees: [],
    is_hidden: false,
    updated_at: UPDATED_AT,
  };
  // The program's commission uses the SECOND type in the list.
  mockCommission = {
    amount: 10,
    currency: "RM",
    type_id: "type-percentage",
    type: "Percentage",
    notes: "Paid per semester",
    expected_commission_from: null,
    expected_commission_to: null,
  };
});

async function saveAfter(edit: () => void) {
  render(<ProgramEditForm id="prog-1" />);
  await screen.findByPlaceholderText("e.g. BSc Data Science");
  edit();
  fireEvent.click(screen.getByText("Save Change"));
  await waitFor(() => expect(mockUpdateProgram).toHaveBeenCalledTimes(1));
  return mockUpdateProgram.mock.calls[0][1];
}

describe("ProgramEditForm save", () => {
  it("sends only the edited field plus the loaded updated_at", async () => {
    const payload = await saveAfter(() =>
      fireEvent.change(screen.getByPlaceholderText("e.g. BSc Data Science"), {
        target: { value: "BSc Computing (Hons)" },
      })
    );

    expect(payload).toEqual({ name: "BSc Computing (Hons)", expected_updated_at: UPDATED_AT });
  });

  it("keeps the program's own commission type and sends the commission as a unit", async () => {
    const payload = await saveAfter(() => {
      // Sections after the first start closed; open Fees & Commission like a user would.
      fireEvent.click(screen.getByRole("button", { name: /Fees & Commission/ }));
      fireEvent.change(screen.getByRole("textbox", { name: /Commission notes/ }), {
        target: { value: "Paid yearly" },
      });
    });

    expect(payload).toEqual({
      commission_amount: 10,
      commission_currency: "RM",
      commission_type_id: "type-percentage",
      commission_notes: "Paid yearly",
      expected_commission_from: null,
      expected_commission_to: null,
      expected_updated_at: UPDATED_AT,
    });
  });

  it("shows the backend's conflict message when someone else saved first", async () => {
    mockUpdateProgram.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          code: "program_modified",
          message: "This program was changed by someone else after you opened it.",
        },
      },
    });

    await saveAfter(() =>
      fireEvent.change(screen.getByPlaceholderText("e.g. BSc Data Science"), {
        target: { value: "BSc Computing (Hons)" },
      })
    );

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining("changed by someone else"),
        "error"
      )
    );
  });
});
