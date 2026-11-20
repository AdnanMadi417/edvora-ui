import {
  configurationErrors,
  emptyConfiguration,
  emptyCourse,
} from "./configuration";
import {
  readCentreConfiguration,
  saveCentreConfiguration,
} from "./hooks/useCentreConfiguration";

beforeEach(() => localStorage.clear());
function fixture() {
  const course = emptyCourse();
  course.name = "Intensive English";
  course.language = "English";
  course.levels = [
    {
      id: "beginner",
      name: "Beginner",
      order: "1",
      duration: "4 weeks",
      learningHours: "80",
    },
  ];
  course.fees = [
    {
      id: "fee",
      amount: "1200",
      currency: "MYR",
      basis: "level",
      levelId: "beginner",
    },
  ];
  return {
    ...emptyConfiguration(),
    enabled: true,
    name: "Language Academy",
    courses: [course],
  };
}
it("validates money, level associations and duplicate level order", () => {
  const value = fixture();
  expect(configurationErrors(value)).toEqual({});
  value.courses[0].fees[0] = {
    ...value.courses[0].fees[0],
    amount: "-1",
    currency: "Ringgit",
    levelId: "missing",
  };
  value.courses[0].levels.push({ ...value.courses[0].levels[0], id: "other" });
  value.courses[0].intakes = [{ id: "date", date: "2026-02-30" }];
  expect(configurationErrors(value)).toEqual(
    expect.objectContaining({
      "courses.0.fees.0.amount": expect.any(String),
      "courses.0.fees.0.currency": expect.any(String),
      "courses.0.fees.0.levelId": expect.any(String),
      "courses.0.levels.1.order": expect.any(String),
    })
  );
});
it("requires an enabled centre name without validating retired hidden fields", () => {
  const value = {
    ...emptyConfiguration(),
    enabled: true,
    website: "javascript:alert(1)",
  };
  expect(configurationErrors(value)).toEqual(
    expect.objectContaining({
      name: expect.any(String),
    })
  );
  expect(configurationErrors({ ...value, name: "Centre" })).toEqual({});
});
it("preserves zero fees, does not invent prices, and scopes saved information by university", () => {
  const value = fixture();
  value.courses[0].fees[0].amount = "0";
  saveCentreConfiguration("uni-one", value);
  expect(readCentreConfiguration("uni-one")).toEqual(value);
  expect(readCentreConfiguration("uni-two")).toBeNull();
  value.courses[0].fees[0].amount = "";
  expect(configurationErrors(value)["courses.0.fees.0.amount"]).toBeTruthy();
  expect(() => saveCentreConfiguration("uni-one", value)).toThrow();
});
it("hides disabled configuration and reports corrupt or unavailable storage", () => {
  saveCentreConfiguration("uni-one", { ...fixture(), enabled: false });
  expect(readCentreConfiguration("uni-one")).toEqual(emptyConfiguration());
  localStorage.setItem("unibexs:language-centre:v1:broken", "bad json");
  expect(() => readCentreConfiguration("broken")).toThrow();
  const storage = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
  expect(() => saveCentreConfiguration("uni-one", fixture())).toThrow(
    /Storage may be full/
  );
  storage.mockRestore();
});

import { cityState } from "./types";

it("lists show the city and state, the last two parts of the address", () => {
  expect(cityState("Level 3, Learning Centre, Bukit Jalil, Kuala Lumpur")).toBe("Bukit Jalil, Kuala Lumpur");
  expect(cityState("Kuala Lumpur")).toBe("Kuala Lumpur");
  expect(cityState(" , ")).toBe("");
});
