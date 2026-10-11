import React from "react";
import { render, screen } from "@testing-library/react";
import CatalogueQuotaNotice from "./CatalogueQuotaNotice";

describe("CatalogueQuotaNotice", () => {
  it("tells the partner it is a daily limit and who to contact, without numbers", () => {
    render(
      <CatalogueQuotaNotice
        quota={{ metric: "program_detail_views", limit: 300, count: 301, resetsAt: new Date(), message: "Daily catalogue limit reached." }}
      />,
    );
    expect(screen.getByText("You've reached today's limit for browsing the catalogue")).toBeInTheDocument();
    expect(screen.getByText(/try again tomorrow/)).toBeInTheDocument();
    expect(screen.getByText(/contact your account manager/)).toBeInTheDocument();
    // The limit, the count, the metric and the countdown are log-only on purpose.
    expect(screen.queryByText(/300/)).toBeNull();
    expect(screen.queryByText(/301/)).toBeNull();
    expect(screen.queryByText(/program pages|catalogue results|midnight|hours/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
