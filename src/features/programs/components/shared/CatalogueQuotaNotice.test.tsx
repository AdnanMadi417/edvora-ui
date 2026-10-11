import React from "react";
import { render, screen } from "@testing-library/react";
import CatalogueQuotaNotice from "./CatalogueQuotaNotice";

describe("CatalogueQuotaNotice", () => {
  it("explains the limit, the metric and when it resets", () => {
    const resetsAt = new Date(Date.now() + 5 * 3_600_000 + 60_000);
    render(
      <CatalogueQuotaNotice
        quota={{ metric: "program_detail_views", limit: 300, count: 301, resetsAt, message: "Daily catalogue limit reached." }}
      />,
    );
    expect(screen.getByText("You've reached today's catalogue limit")).toBeInTheDocument();
    expect(screen.getByText(/up to 300 program pages a day/)).toBeInTheDocument();
    expect(screen.getByText(/in about 6 hours/)).toBeInTheDocument();
    expect(screen.getByText(/contact your account manager/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("still reads well without limit or reset details", () => {
    render(<CatalogueQuotaNotice quota={{ metric: "program_list_rows", limit: null, count: null, resetsAt: null, message: "x" }} />);
    expect(screen.getByText(/It resets at midnight, Malaysia time\./)).toBeInTheDocument();
    expect(screen.queryByText(/up to/)).toBeNull();
  });
});
