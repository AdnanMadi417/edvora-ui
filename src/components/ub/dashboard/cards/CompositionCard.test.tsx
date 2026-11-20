import { render, screen } from "@testing-library/react";
import CompositionCard from "./CompositionCard";

const items = [
  { key: "bachelor", label: "Bachelor", value: 1124, href: "/bachelor" },
  { key: "english", label: "English", value: 518 },
  { key: "foundation", label: "Foundation", value: 130 },
  { key: "master", label: "Master", value: 116 },
  { key: "phd", label: "PhD", value: 110 },
  { key: "diploma", label: "Diploma", value: 28 },
  { key: "certificate", label: "Certificate", value: 6 },
];
const rows = [
  { label: "2024", total: 925, parts: [{ key: "classified", label: "Classified", value: 722 }, { key: "missing", label: "Not recorded", value: 203 }] },
  { label: "2025", total: 930, parts: [{ key: "classified", label: "Classified", value: 763 }, { key: "missing", label: "Not recorded", value: 167 }] },
  { label: "2026", total: 571, parts: [{ key: "classified", label: "Classified", value: 547 }, { key: "missing", label: "Not recorded", value: 24 }] },
];

test("lists every part with its own share, and reconciles each year", () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  render(
    <CompositionCard
      title="Study level"
      unit="students"
      centerLabel="Classified students"
      items={items}
      summary={{ value: 2426, label: "Total students", detail: "925 + 930 + 571" }}
      reconciliation={{ title: "Students per year", rows, matchesDonut: "classified" }}
    />
  );
  expect(screen.getByRole("link", { name: "Bachelor: 1,124 students, 55.3%" })).toHaveAttribute("href", "/bachelor");
  expect(screen.queryByText("Other")).not.toBeInTheDocument();
  for (const share of ["25.5%", "6.4%", "5.7%", "5.4%", "1.4%", "0.3%"]) expect(screen.getByText(share)).toBeInTheDocument();
  expect(screen.getByText("2,426")).toBeInTheDocument();
  expect(screen.getByRole("listitem", { name: "2026: 571 students. Classified 547, Not recorded 24" })).toBeInTheDocument();
  // 722 + 763 + 547 = 2,032 = the donut, so no warning.
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test("warns in development when a year's parts don't add up to its total", () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  render(
    <CompositionCard
      title="Study level"
      unit="students"
      centerLabel="Classified students"
      items={items}
      reconciliation={{ title: "Students per year", rows: [{ ...rows[0], total: 930 }] }}
    />
  );
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("2024: parts add up to 925, total is 930"));
  warn.mockRestore();
});

test("month view: tabs per year open on the latest, one compact row per month", () => {
  const month = (label: string, c: number, m: number) => ({
    label,
    total: c + m,
    parts: [{ key: "classified", label: "Classified", value: c }, { key: "missing", label: "Not recorded", value: m }],
  });
  const groups = [
    { id: "2025", label: "2025", rows: [month("Jan", 10, 2), month("Feb", 5, 1), month("Mar", 4, 0), month("Apr", 3, 0), month("May", 6, 1)] },
    { id: "2026", label: "2026", rows: [month("Jan", 8, 1), month("Feb", 4, 0), month("Mar", 2, 0), month("Apr", 1, 0), month("May", 3, 0)] },
  ];
  render(<CompositionCard title="Study level" unit="students" centerLabel="Classified" items={items} reconciliation={{ title: "Students per month", groups }} />);
  expect(screen.getByRole("tab", { name: "2026 · 19" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("listitem", { name: "Jan: 9 students. Classified 8, Not recorded 1" })).toBeInTheDocument();
  screen.getByRole("tab", { name: "2025 · 32" }).click();
});

test("past seven parts it switches to ranked bars and still lists every part", () => {
  const many = Array.from({ length: 9 }, (_, i) => ({ key: `f${i}`, label: `Field ${i + 1}`, value: 90 - i * 10 }));
  render(<CompositionCard title="By field" unit="applications" centerLabel="With a field" items={many} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByRole("list", { name: /With a field/ }).querySelectorAll("li")).toHaveLength(9);
  expect(screen.getByText("1. Field 1: 90 applications, 20.0%")).toBeInTheDocument();
});

test("ranked layout with top shows that many parts, then one Others row", () => {
  const many = Array.from({ length: 9 }, (_, i) => ({ key: `f${i}`, label: `Field ${i + 1}`, value: 90 - i * 10 }));
  render(<CompositionCard title="By field" unit="applications" centerLabel="With a field" items={many} layout="ranked" top={5} restLabel={(n) => `Others (${n} fields)`} />);
  const rows = screen.getByRole("list", { name: /With a field/ }).querySelectorAll("li");
  expect(rows).toHaveLength(6);
  expect(screen.getByText("Others (4 fields): 100 applications, 22.2%")).toBeInTheDocument();
});
