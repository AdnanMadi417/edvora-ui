import { configurationSchema } from "../configuration";
import {
  demoCentreConfigurations,
  getDemoCentreConfiguration,
} from "./demoData";
import {
  readCentreConfiguration,
  saveCentreConfiguration,
} from "../hooks/useCentreConfiguration";

const previousMockSetting = process.env.NEXT_PUBLIC_USE_MOCKS;
beforeEach(() => {
  localStorage.clear();
  process.env.NEXT_PUBLIC_USE_MOCKS = "true";
});
afterAll(() => {
  if (previousMockSetting === undefined)
    delete process.env.NEXT_PUBLIC_USE_MOCKS;
  else process.env.NEXT_PUBLIC_USE_MOCKS = previousMockSetting;
});
it("provides valid demo courses and pricing without removed fields", () => {
  const centres = Object.values(demoCentreConfigurations);
  expect(centres).toHaveLength(5);
  centres.forEach((centre) => {
    expect(configurationSchema.safeParse(centre).success).toBe(true);
    expect(centre.courses).toHaveLength(3);
    expect(centre.website).toBe("");
    expect(centre.email).toBe("");
    expect(centre.phone).toBe("");
    expect(centre.sources).toEqual([]);
    expect(centre.brochure).toBeNull();
    expect(centre.courses.every((course) => course.intakes.length === 0)).toBe(
      true
    );
    const courses = centre.courses;
    expect(
      new Set(courses.flatMap((course) => course.fees.map((fee) => fee.basis)))
    ).toEqual(new Set(["level", "month", "course"]));
    expect(courses[0].charges.map((charge) => charge.kind)).toEqual([
      "Visa",
      "Insurance",
      "Accommodation",
      "Refundable deposit",
      "Other",
    ]);
    expect(
      courses[0].charges.find((charge) => charge.kind === "Refundable deposit")
        ?.refundable
    ).toBe(true);
  });
});
it("shows fixtures without writing storage, and keeps saved changes and disabled centres", () => {
  const initial = readCentreConfiguration("uni_001")!;
  expect(initial.name).toBe("Asia Pacific University Language Centre");
  expect(localStorage.length).toBe(0);
  saveCentreConfiguration("uni_001", { ...initial, name: "My edited centre" });
  expect(readCentreConfiguration("uni_001")?.name).toBe("My edited centre");
  saveCentreConfiguration("uni_001", { ...initial, enabled: false });
  expect(readCentreConfiguration("uni_001")?.enabled).toBe(false);
  expect(readCentreConfiguration("new-university")).toBeNull();
});
it("returns isolated copies so editing a fixture cannot change another view", () => {
  const first = getDemoCentreConfiguration("uni_001")!;
  first.courses[0].name = "Changed";
  expect(getDemoCentreConfiguration("uni_001")?.courses[0].name).toBe(
    "Intensive English Programme"
  );
});
it("does not expose dummy information when mocks are disabled", () => {
  const previous = process.env.NEXT_PUBLIC_USE_MOCKS;
  process.env.NEXT_PUBLIC_USE_MOCKS = "false";
  try {
    expect(getDemoCentreConfiguration("uni_001")).toBeNull();
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_USE_MOCKS;
    else process.env.NEXT_PUBLIC_USE_MOCKS = previous;
  }
});
