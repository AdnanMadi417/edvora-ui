import { render, screen } from "@testing-library/react";
import ApplicationsTable, { type ApplicationListRow } from "features/applications/components/ApplicationsTable";

jest.mock("services/documentService", () => ({ getDocumentDownloadUrl: jest.fn().mockResolvedValue("x") }));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const ROWS: ApplicationListRow[] = [
  { id: "app_001", student_name: "Nur Aisyah", passport_number: "A123", program_name: "BSc Computing", university_name: "Sunway University", partner_name: "Farid", account_manager_name: "Lim", stage: "Institution Review", status: "Correction Requested", updated_at: "2026-11-01T00:00:00Z" },
  { id: "app_002", student_name: "Chinedu, Okafor", program_name: "MBA", university_name: "Taylor's", stage: "Visa Processing", status: "New Application", updated_at: "2026-10-01T00:00:00Z" },
];
const label = (s: string) => s;

describe("ApplicationsTable", () => {
  it("rows open the application in a new tab and flag action needed", () => {
    render(<ApplicationsTable rows={ROWS} hrefFor={(id) => `/admin/applications/${id}`} ownership="advisor-and-manager" statusLabel={label} needsAction={(s) => s === "New Application"} />);
    const link = screen.getByRole("link", { name: /Nur Aisyah/ });
    expect(link).toHaveAttribute("href", "/admin/applications/app_001");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getAllByText("Action needed")).toHaveLength(1);
    expect(screen.getByRole("columnheader", { name: /Advisor \/ manager/ })).toBeInTheDocument();
  });

  it("shows application details without selection or export actions", () => {
    render(<ApplicationsTable rows={ROWS} hrefFor={(id) => id} ownership="advisor-and-manager" statusLabel={label} needsAction={() => false} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Export/ })).not.toBeInTheDocument();
    expect(screen.getByText("BSc Computing")).toBeInTheDocument();
    expect(screen.getByText("Farid")).toBeInTheDocument();
  });
});
