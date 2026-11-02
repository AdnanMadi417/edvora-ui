import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationsTable, { applicationsCsv, type ApplicationListRow } from "features/applications/components/ApplicationsTable";

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

  it("staff can select rows and get the export action", () => {
    render(<ApplicationsTable rows={ROWS} hrefFor={(id) => id} statusLabel={label} needsAction={() => false} selectable defaultDensity="compact" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Nur Aisyah" }));
    expect(screen.getByRole("button", { name: "Export 1 as CSV" })).toBeInTheDocument();
  });

  it("CSV quotes values and uses status labels", () => {
    const csv = applicationsCsv(ROWS, (s) => s.toUpperCase());
    expect(csv.split("\n")[0]).toContain('"Student","Passport number"');
    expect(csv).toContain('"Chinedu, Okafor"');
    expect(csv).toContain('"CORRECTION REQUESTED"');
  });
});
