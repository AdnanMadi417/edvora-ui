import {
  assignedCentre,
  saveAssignedCentre,
  inviteCentreAdmin,
  updateCentreAdmin,
  setCentreAssociation,
  addIndependentCentre,
  readWorkspace,
  publishedCentreConfiguration,
  mergePublishedCentres,
  updatePublishedCentreBasics,
  removePublishedCentre,
  WORKSPACE_KEY,
} from "./centreWorkspace";
import type { ManagedCentre } from "../model/types";
const platform = { id: "platform-admin", role: "admin" };
const actor = {
  id: "mock-language_centre_admin",
  role: "language_centre_admin",
};
const patch = (centre: ManagedCentre) => ({
  configuration: centre.configuration,
  branches: centre.branches,
  logo: centre.logo,
  images: centre.images,
});
beforeEach(() => localStorage.clear());
it("scopes reads and writes to the assigned centre and permits several admins", () => {
  const own = assignedCentre(actor);
  expect(assignedCentre({ ...actor, id: "centre-admin-colleague" }).id).toBe(
    own.id
  );
  const other = readWorkspace().centres.find((centre) => centre.id !== own.id)!;
  expect(() => saveAssignedCentre(actor, other.id, patch(other))).toThrow(
    /only update your assigned centre/
  );
  saveAssignedCentre(actor, own.id, {
    ...patch(own),
    configuration: {
      ...own.configuration,
      description: "Updated by centre staff",
    },
  });
  expect(assignedCentre(actor).configuration.description).toBe(
    "Updated by centre staff"
  );
  expect(
    readWorkspace().centres.find((centre) => centre.id === other.id)
  ).toEqual(other);
});
it("rejects foreign branches, association changes and unauthorized admin operations", () => {
  const own = assignedCentre(actor);
  const other = readWorkspace().centres.find((centre) => centre.id !== own.id)!;
  expect(() =>
    saveAssignedCentre(actor, own.id, {
      ...patch(own),
      branches: other.branches,
    })
  ).toThrow(/branch from another centre/);
  expect(() =>
    saveAssignedCentre(actor, own.id, {
      ...patch(own),
      universityId: "uni_999",
    } as any)
  ).toThrow(/association/);
  expect(() =>
    inviteCentreAdmin(actor, {
      name: "New User",
      email: "new@example.com",
      centreId: own.id,
    })
  ).toThrow(/Only Unibexs Admins/);
  expect(() =>
    updateCentreAdmin(actor, actor.id, { centreId: other.id })
  ).toThrow(/Only Unibexs Admins/);
  expect(() =>
    setCentreAssociation(actor, own.id, "independent", null)
  ).toThrow(/Only Unibexs Admins/);
  expect(() => assignedCentre({ ...actor, role: "partner" })).toThrow(
    /only available/
  );
});
it("requires a centre on invitation, rejects duplicate emails and gates invited accounts", () => {
  expect(() =>
    inviteCentreAdmin(platform, {
      name: "New User",
      email: "new@example.com",
      centreId: "",
    })
  ).toThrow();
  inviteCentreAdmin(platform, {
    name: "New User",
    email: "new@example.com",
    centreId: "lc_001",
  });
  const invited = readWorkspace().users.find(
    (user) => user.email === "new@example.com"
  )!;
  expect(() => assignedCentre({ ...actor, id: invited.id })).toThrow(
    /access is unavailable/
  );
  expect(() =>
    inviteCentreAdmin(platform, {
      name: "Duplicate",
      email: "NEW@example.com",
      centreId: "lc_001",
    })
  ).toThrow(/already has/);
  updateCentreAdmin(platform, invited.id, { status: "active" });
  expect(assignedCentre({ ...actor, id: invited.id }).id).toBe("lc_001");
});
it("revokes access on suspension and removal, and supports reassignment to independent centres", () => {
  updateCentreAdmin(platform, actor.id, { status: "suspended" });
  expect(() => assignedCentre(actor)).toThrow(/access is unavailable/);
  updateCentreAdmin(platform, actor.id, {
    status: "active",
    centreId: "independent_001",
  });
  expect(assignedCentre(actor).type).toBe("independent");
  expect(assignedCentre(actor).universityId).toBeNull();
  updateCentreAdmin(platform, actor.id, { status: "removed" });
  expect(() => assignedCentre(actor)).toThrow(/access is unavailable/);
  expect(() =>
    updateCentreAdmin(platform, actor.id, { status: "active" })
  ).toThrow(/no longer available/);
  expect(assignedCentre({ ...actor, id: "centre-admin-colleague" }).id).toBe(
    "lc_001"
  );
});
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
});
it("publishes saved centre content to existing views without creating storage on read", () => {
  expect(publishedCentreConfiguration("uni_001")).toBeNull();
  expect(localStorage.length).toBe(0);
  const own = assignedCentre(actor);
  saveAssignedCentre(actor, own.id, {
    ...patch(own),
    configuration: { ...own.configuration, name: "Updated Centre" },
  });
  expect(publishedCentreConfiguration("uni_001")?.name).toBe("Updated Centre");
  const items = mergePublishedCentres([]);
  expect(items.find((centre) => centre.id === own.id)?.name).toBe(
    "Updated Centre"
  );
  expect(items.some((centre) => centre.centre_type === "independent")).toBe(
    true
  );
});
it("rejects invalid courses and reports corrupt or unavailable browser storage", () => {
  const own = assignedCentre(actor);
  expect(() =>
    saveAssignedCentre(actor, own.id, {
      ...patch(own),
      configuration: {
        ...own.configuration,
        courses: [{ ...own.configuration.courses[0], name: "" }],
      },
    })
  ).toThrow();
  const set = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
  expect(() => saveAssignedCentre(actor, own.id, patch(own))).toThrow(
    /Browser storage/
  );
  set.mockRestore();
  localStorage.setItem(WORKSPACE_KEY, "bad json");
  expect(() => readWorkspace()).toThrow();
});

it("preserves existing university-centre configuration when the new workspace is initialized", () => {
  const saved = {
    ...assignedCentre(actor).configuration,
    name: "Existing saved name",
  };
  localStorage.setItem(
    "unibexs:language-centre:v1:uni_001",
    JSON.stringify(saved)
  );
  expect(assignedCentre(actor).configuration.name).toBe("Existing saved name");
});

it("keeps existing platform edits consistent and revokes users when a centre is deleted", () => {
  const own = assignedCentre(actor);
  saveAssignedCentre(actor, own.id, patch(own));
  const basics = {
    university_id: own.universityId!,
    name: "Edited by platform",
    location: "Kuala Lumpur",
    description: "Updated",
    email: "",
    phone: "",
    is_active: true,
  };
  updatePublishedCentreBasics(platform, own.id, basics);
  expect(assignedCentre(actor).configuration.name).toBe("Edited by platform");
  expect(() => updatePublishedCentreBasics(actor, own.id, basics)).toThrow(
    /assigned-centre workspace/
  );
  expect(() =>
    updatePublishedCentreBasics({ id: "data", role: "data_entry" }, own.id, {
      ...basics,
      university_id: "uni_003",
    })
  ).toThrow(/Only Unibexs Admins/);
  removePublishedCentre(platform, own.id);
  expect(() => assignedCentre(actor)).toThrow(/access is unavailable/);
  expect(mergePublishedCentres([{ id: own.id, ...basics }])).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: own.id })])
  );
});
