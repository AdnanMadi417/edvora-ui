import { render, screen } from "@testing-library/react";
import RankedBars from "./RankedBars";

const items = [
  { key: "b", label: "Bangladesh", value: 300 },
  { key: "c", label: "China", value: 600, href: "/china" },
  { key: "i", label: "India", value: 50 },
  { key: "p", label: "Pakistan", value: 50 },
];

test("ranks largest first, folds the tail into Others and links rows", () => {
  render(<RankedBars label="By country" unit="applications" items={items} top={3} />);
  const rows = screen.getAllByRole("listitem");
  expect(rows).toHaveLength(3);
  expect(screen.getByRole("link", { name: "1. China: 600 applications, 60.0%" })).toHaveAttribute("href", "/china");
  expect(screen.getByText("2. Bangladesh: 300 applications, 30.0%")).toBeInTheDocument();
  expect(screen.getByText("Others (2): 100 applications, 10.0%")).toBeInTheDocument();
});

test("states records with no value on top and keeps them out of the ranking", () => {
  render(<RankedBars label="By field" unit="applications" items={items} notRecorded={1000} />);
  expect(screen.getByText(/not recorded/)).toHaveTextContent("Recorded for 50.0% of applications · 1,000 not recorded");
  expect(screen.queryByText(/Not recorded:/)).not.toBeInTheDocument();
  expect(screen.getByRole("list", { name: "By field, 1,000 applications" })).toBeInTheDocument();
});
