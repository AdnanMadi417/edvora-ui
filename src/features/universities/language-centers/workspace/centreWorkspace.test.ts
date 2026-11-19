import {
  setCentreAssociation,
  addIndependentCentre,
  readWorkspace,
  publishedCentreConfiguration,
  mergePublishedCentres,
  updatePublishedCentreBasics,
  removePublishedCentre,
  WORKSPACE_KEY,
} from "./centreWorkspace";
const platform = { id: "platform-admin", role: "admin" };
const basicsOf = (universityId: string, name: string) => ({
  university_id: universityId,
  name,
  location: "Kuala Lumpur",
  description: "Updated",
  email: "",
  phone: "",
  is_active: true,
});
beforeEach(() => localStorage.clear());

it("allows only platform admins to control centre associations and create independent centres", () => {
  addIndependentCentre(platform, "New Independent Centre");
  const created = readWorkspace().centres.find(
    (centre) => centre.configuration.name === "New Independent Centre"
  )!;
  expect(created.type).toBe("independent");
  expect(() =>
    setCentreAssociation(platform, created.id, "university_linked", null)
  ).toThrow(/requires a university/);
  setCentreAssociation(platform, created.id, "university_linked", "uni_002");
  expect(
    readWorkspace().centres.find((centre) => centre.id === created.id)
      ?.universityId
  ).toBe("uni_002");
  expect(() => addIndependentCentre({ id: "d", role: "data_entry" }, "X")).toThrow(/Only Unibexs Admins/);
});

it("publishes saved centre content to existing views without creating storage on read", () => {
  expect(publishedCentreConfiguration("uni_001")).toBeNull();
  expect(localStorage.length).toBe(0);
  const centre = readWorkspace().centres.find((c) => c.universityId === "uni_001")!;
  updatePublishedCentreBasics(platform, centre.id, basicsOf("uni_001", "Updated Centre"));
  expect(publishedCentreConfiguration("uni_001")?.name).toBe("Updated Centre");
  const items = mergePublishedCentres([]);
  expect(items.find((c) => c.id === centre.id)?.name).toBe("Updated Centre");
  expect(items.some((c) => c.centre_type === "independent")).toBe(true);
});

it("reports corrupt or unavailable browser storage", () => {
  const centre = readWorkspace().centres[0];
  const set = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Quota exceeded");
  });
  expect(() => updatePublishedCentreBasics(platform, centre.id, basicsOf(centre.universityId!, "Name"))).toThrow(/Browser storage/);
  set.mockRestore();
  localStorage.setItem(WORKSPACE_KEY, "bad json");
  expect(() => readWorkspace()).toThrow();
});

it("still reads a workspace saved with the old centre-admin accounts", () => {
  const saved = { ...readWorkspace(), users: [{ id: "u", name: "Old", email: "old@example.com", centreId: "lc_001", status: "active" }] };
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(saved));
  const value = readWorkspace();
  expect(value.centres.length).toBeGreaterThan(0);
  expect("users" in value).toBe(false);
});

it("lets admins and data entry edit centres, only admins move them, and removes deleted centres", () => {
  const centre = readWorkspace().centres.find((c) => c.universityId)!;
  updatePublishedCentreBasics({ id: "data", role: "data_entry" }, centre.id, basicsOf(centre.universityId!, "Edited by data entry"));
  expect(readWorkspace().centres.find((c) => c.id === centre.id)?.configuration.name).toBe("Edited by data entry");
  expect(() => updatePublishedCentreBasics({ id: "p", role: "partner" }, centre.id, basicsOf(centre.universityId!, "X"))).toThrow(/Only Unibexs Admins and data entry/);
  expect(() =>
    updatePublishedCentreBasics({ id: "data", role: "data_entry" }, centre.id, basicsOf("uni_003", "X"))
  ).toThrow(/Only Unibexs Admins/);
  removePublishedCentre(platform, centre.id);
  expect(mergePublishedCentres([{ id: centre.id, ...basicsOf(centre.universityId!, "X") }])).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: centre.id })])
  );
});
