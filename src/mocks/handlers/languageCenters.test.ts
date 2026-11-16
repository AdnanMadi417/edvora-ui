import "./languageCenters";
import { matchRoute, MockReply } from "../router";
import { universities } from "./universities";
import { validateLanguageCenter } from "features/universities/language-centers/types";
function request(
  method: "get" | "post" | "put" | "delete",
  path: string,
  body?: unknown
): any {
  const { route, params } = matchRoute(method, path)!;
  return route.handler({ method, path, params, query: {}, body });
}
const path = "/knowledge-hub/language-centers";
it("validates links and maintains university availability as centers move and are deleted", () => {
  const first = universities
    .all()
    .find((university) => !university.has_language_center)!;
  const second = universities
    .all()
    .filter((university) => !university.has_language_center)[1]!;
  const data = {
    name: "Test Center",
    university_id: first.id,
    location: "Malaysia",
    email: "",
    phone: "",
    description: "",
    is_active: true,
  };
  expect(
    request("post", path, { ...data, university_id: "missing" })
  ).toBeInstanceOf(MockReply);
  const a = request("post", path, data),
    b = request("post", path, data);
  expect(first.has_language_center).toBe(true);
  request("put", `${path}/${a.id}`, { ...data, university_id: second.id });
  expect(first.has_language_center).toBe(true);
  expect(second.has_language_center).toBe(true);
  request("delete", `${path}/${b.id}`);
  expect(first.has_language_center).toBe(false);
  request("delete", `${path}/${a.id}`);
  expect(second.has_language_center).toBe(false);
  expect(request("delete", `${path}/${a.id}`)).toBeInstanceOf(MockReply);
});
it("requires a name, university and location, and validates optional email", () => {
  expect(
    validateLanguageCenter({
      name: " ",
      university_id: "",
      location: "",
      email: "bad",
      phone: "",
      description: "",
      is_active: true,
    })
  ).toEqual({
    name: expect.any(String),
    university_id: expect.any(String),
    location: expect.any(String),
    email: expect.any(String),
  });
});

it("returns list snapshots so later writes cannot mutate UI state or duplicate new rows", () => {
  const university = universities.all()[0];
  const snapshot = request("get", path).items;
  const before = snapshot.length;
  const created = request("post", path, {
    name: "Snapshot Center",
    university_id: university.id,
    location: "Malaysia",
    email: "",
    phone: "",
    description: "",
    is_active: true,
  });
  expect(snapshot).toHaveLength(before);
  const next = request("get", path).items;
  expect(next).toHaveLength(before + 1);
  request("put", `${path}/${created.id}`, {
    ...created,
    name: "Renamed Center",
  });
  expect(next.find((center) => center.id === created.id).name).toBe(
    "Snapshot Center"
  );
  request("delete", `${path}/${created.id}`);
});
