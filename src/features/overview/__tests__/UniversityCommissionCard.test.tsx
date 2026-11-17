import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityCommissionCard from "../components/UniversityCommissionCard";
import { groupUniversityCommission } from "../model/dashboardData";
import type { CommissionQueueItem } from "features/applications/payouts/types";
const record = {
  application_commission_id: "c1",
  application_id: "a1",
  student_name: "Amina",
  reference: "REF-1",
  university_name: "Example University",
  commission_amount: 250,
  commission_currency: "MYR",
  paid_amount: null,
  paid_currency: null,
  waiting_on: "us",
} as CommissionQueueItem;
it("shows university identity and opens only the records behind an amount", async () => {
  const user = userEvent.setup();
  render(
    <UniversityCommissionCard
      admin
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 2,
          items: [],
          universities: [{ id: "u1", name: "Example University" }],
          universityCommission: groupUniversityCommission(
            [
              record,
              {
                ...record,
                application_commission_id: "c2",
                application_id: "a2",
                student_name: "Nadia",
                commission_currency: "USD",
                commission_amount: 100,
              },
            ],
            true
          ),
        },
      }}
    />
  );
  expect(
    screen.getAllByRole("link", { name: "Example University" })[0]
  ).toHaveAttribute("href", "/admin/universities/u1");
  await user.click(
    screen.getByRole("button", {
      name: "Ready for payout for Example University in MYR",
    })
  );
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByRole("link", { name: "Amina" })).toHaveAttribute(
    "href",
    "/admin/applications/a1"
  );
  expect(within(dialog).queryByText("Nadia")).not.toBeInTheDocument();
  expect(within(dialog).getByText("MYR 250.00")).toBeInTheDocument();
});
it("renders undisclosed amounts without presenting them as zero", () => {
  render(
    <UniversityCommissionCard
      admin={false}
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 1,
          items: [],
          universityCommission: groupUniversityCommission(
            [{ ...record, commission_amount: null }],
            false
          ),
        },
      }}
    />
  );
  expect(
    screen.getByRole("button", {
      name: "Ready for payout for Example University in MYR",
    })
  ).toHaveTextContent("Not available");
  expect(screen.queryByText("MYR 0.00")).not.toBeInTheDocument();
});
