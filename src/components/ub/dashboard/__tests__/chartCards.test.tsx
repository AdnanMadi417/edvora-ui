import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RefreshCw } from "lucide-react";
import BarChartCard from "../cards/BarChartCard";
import GaugeCard from "../cards/GaugeCard";

test("bar card composes real chart data, summary and a functioning menu", () => {
  const refresh = jest.fn();
  render(
    <BarChartCard
      title="Applications"
      as="h2"
      data={[
        { label: "Mon", value: 5 },
        { label: "Tue", value: 2, status: "pending" },
      ]}
      label="Weekly applications"
      unit="applications"
      stats={[
        { label: "Submitted", value: 5 },
        { label: "Pending", value: 2 },
      ]}
      menu={{
        label: "Application chart options",
        extraItems: [
          { label: "Refresh data", icon: RefreshCw, onClick: refresh },
        ],
      }}
    />
  );
  expect(
    screen.getByRole("heading", { name: "Applications" })
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("Tue: 2 applications (pending)")
  ).toBeInTheDocument();
  expect(screen.getByText("Submitted")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Application chart options" })
  );
  fireEvent.click(screen.getByText("Refresh data"));
  expect(refresh).toHaveBeenCalledTimes(1);
});
test("bar card error does not render chart or summary figures", () => {
  render(
    <BarChartCard
      title="Applications"
      data={[]}
      label="Weekly applications"
      state="error"
      errorMessage="Unavailable"
      stats={[{ label: "Submitted", value: 0 }]}
    />
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Unavailable");
  expect(screen.queryByText("Submitted")).not.toBeInTheDocument();
});
test("empty gauge does not invent a percentage", () => {
  render(
    <GaugeCard
      title="Placement"
      label="Placement rate"
      segments={[]}
      emptyMessage="No placements yet"
    />
  );
  expect(screen.getByText("No placements yet")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
test("gauge card renders its supplied segments and matching legend", () => {
  render(
    <GaugeCard
      title="Placement"
      label="Placement rate"
      segments={[
        { label: "Placed", value: 62, color: "cat-1" },
        { label: "In progress", value: 27, color: "cat-2" },
        { label: "Withdrawn", value: 11, color: "cat-3" },
      ]}
      centerLabel="62%"
      centerCaption="placed this intake"
    />
  );
  expect(
    screen.getByRole("img", {
      name: "Placement rate: Placed 62%, In progress 27%, Withdrawn 11%",
    })
  ).toBeInTheDocument();
  expect(screen.getByText("placed this intake")).toBeInTheDocument();
});
