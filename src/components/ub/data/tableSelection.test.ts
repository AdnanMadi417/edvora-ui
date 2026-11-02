import { pageSelectionState, selectRange, toggleId, togglePage } from "./tableSelection";

const ids = ["a", "b", "c", "d", "e"];

describe("table selection rules", () => {
  it("toggles one id", () => {
    expect(toggleId(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("shift-selects a range in either direction, skipping disabled rows", () => {
    expect(selectRange(["b"], ids, "b", "d")).toEqual(["b", "c", "d"]);
    expect(selectRange([], ids, "d", "b")).toEqual(["b", "c", "d"]);
    expect(selectRange([], ids, "a", "e", (id) => id !== "c")).toEqual(["a", "b", "d", "e"]);
  });

  it("shift on a selected row clears the range", () => {
    expect(selectRange(["a", "b", "c", "d"], ids, "a", "c")).toEqual(["d"]);
  });

  it("page state and toggle ignore other pages", () => {
    expect(pageSelectionState([], ids)).toBe("none");
    expect(pageSelectionState(["a"], ids)).toBe("some");
    expect(pageSelectionState(ids, ids)).toBe("all");
    expect(togglePage(["x"], ["a", "b"])).toEqual(["x", "a", "b"]);
    expect(togglePage(["x", "a", "b"], ["a", "b"])).toEqual(["x"]);
  });
});
