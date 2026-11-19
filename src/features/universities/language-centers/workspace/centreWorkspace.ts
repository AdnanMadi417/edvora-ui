import {
  configurationSchema,
  emptyConfiguration,
  newId,
  type CentreConfiguration,
} from "features/universities/language-centers/configuration";
import { demoCentreConfigurations } from "features/universities/language-centers/fixtures/demoData";
import {
  type CentreActor,
  type CentreWorkspace,
  type ManagedCentre,
} from "./types";
import { z } from "zod";
export const WORKSPACE_KEY = "unibexs:centre-admin-workspace:v1";
export const WORKSPACE_EVENT = "centre-workspace-updated";
const asset = z.object({
  name: z.string().min(1),
  url: z
    .string()
    .refine(
      (v) => /^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(v),
      "Choose a supported image or PDF."
    ),
});
const workspaceSchema = z.object({
  version: z.literal(1),
  centres: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(["university_linked", "independent"]),
      universityId: z.string().nullable(),
      configuration: configurationSchema,
      branches: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().trim().min(1),
          location: z.string().trim().min(1),
          address: z.string(),
        })
      ),
      logo: asset.nullable(),
      images: z.array(asset.extend({ id: z.string() })).max(4),
    })
  ),
  // Older saved workspaces also held centre-admin accounts; they are ignored.
  users: z.array(z.unknown()).optional(),
});
export function initialWorkspace(): CentreWorkspace {
  const centres: ManagedCentre[] = Object.entries(demoCentreConfigurations).map(
    ([universityId, configuration], i) => ({
      id: `lc_${String(i + 1).padStart(3, "0")}`,
      type: "university_linked",
      universityId,
      configuration: {
        ...JSON.parse(JSON.stringify(configuration)),
        email: `hello@centre${i + 1}.example`,
        phone: "+60 3 5550 1100",
        website: `https://centre${i + 1}.example`,
        courses: configuration.courses.map((course, ci) => ({
          ...JSON.parse(JSON.stringify(course)),
          intakes: [{ id: `intake-${i}-${ci}`, date: `2027-0${ci + 1}-11` }],
        })),
      },
      branches: [
        {
          id: `branch-${i}`,
          name: "Main branch",
          location: configuration.location,
          address: "",
        },
      ],
      logo: null,
      images: [],
    })
  );
  for (const centre of centres) {
    const raw = localStorage.getItem(
      `unibexs:language-centre:v1:${centre.universityId}`
    );
    if (!raw) continue;
    try {
      const saved = configurationSchema.parse(
        JSON.parse(raw)
      ) as CentreConfiguration;
      centre.configuration = {
        ...saved,
        name: saved.name || centre.configuration.name,
      };
    } catch {
      /* Corrupt legacy records stay isolated from the new workspace. */
    }
  }
  centres.push({
    id: "independent_001",
    type: "independent",
    universityId: null,
    configuration: {
      ...emptyConfiguration(),
      enabled: true,
      name: "Horizon Language Academy",
      description:
        "Independent language learning centre. Illustrative demo information.",
      location: "Kuala Lumpur",
      courses: JSON.parse(JSON.stringify(centres[0].configuration.courses)),
    },
    branches: [],
    logo: null,
    images: [],
  });
  return {
    version: 1,
    centres,
  };
}
export function readWorkspace(): CentreWorkspace {
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return initialWorkspace();
  const { version, centres } = workspaceSchema.parse(JSON.parse(raw));
  return { version, centres } as CentreWorkspace;
}
function commit(value: CentreWorkspace) {
  const checked = workspaceSchema.parse(value);
  for (const centre of value.centres)
    if ((centre.type === "university_linked") !== !!centre.universityId)
      throw new Error(
        "A university-linked centre requires a university; independent centres cannot be linked."
      );
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(checked));
  } catch {
    throw new Error(
      "Unable to save. Browser storage is full or unavailable; remove large images and try again."
    );
  }
  window.dispatchEvent(new Event(WORKSPACE_EVENT));
}
export function requirePlatformAdmin(actor: CentreActor | null | undefined) {
  if (actor?.role !== "admin")
    throw new Error(
      "Only Unibexs Admins can manage language centres."
    );
}
export function setCentreAssociation(
  actor: CentreActor,
  centreId: string,
  type: ManagedCentre["type"],
  universityId: string | null
) {
  requirePlatformAdmin(actor);
  const value = readWorkspace();
  if (!value.centres.some((centre) => centre.id === centreId))
    throw new Error("Centre unavailable.");
  value.centres = value.centres.map((centre) =>
    centre.id === centreId ? { ...centre, type, universityId } : centre
  );
  commit(value);
}
export function addIndependentCentre(actor: CentreActor, name: string) {
  requirePlatformAdmin(actor);
  if (!name.trim()) throw new Error("Enter the centre name.");
  const value = readWorkspace();
  value.centres.push({
    id: newId(),
    type: "independent",
    universityId: null,
    configuration: {
      ...emptyConfiguration(),
      enabled: true,
      name: name.trim(),
    },
    branches: [],
    logo: null,
    images: [],
  });
  commit(value);
}

/** Public frontend projection. No workspace is created merely by browsing. */
export function publishedCentreConfiguration(
  id: string
): CentreConfiguration | null {
  if (typeof window === "undefined" || !localStorage.getItem(WORKSPACE_KEY))
    return null;
  const value = readWorkspace();
  return (
    value.centres.find(
      (centre) => centre.id === id || centre.universityId === id
    )?.configuration || null
  );
}
export function mergePublishedCentres(
  items: import("features/universities/language-centers/types").LanguageCenter[]
) {
  if (typeof window === "undefined" || !localStorage.getItem(WORKSPACE_KEY))
    return items;
  const value = readWorkspace();
  const mapped = value.centres.map((centre) => ({
    id: centre.id,
    university_id: centre.universityId || "",
    centre_type: centre.type,
    logo_url: centre.logo?.url,
    images: centre.images,
    branches: centre.branches,
    name: centre.configuration.name,
    location: centre.configuration.location,
    email: centre.configuration.email,
    phone: centre.configuration.phone,
    description: centre.configuration.description,
    is_active: centre.configuration.enabled,
  }));
  const ids = new Set(mapped.map((centre) => centre.id));
  return [
    ...items.filter(
      (centre) => !ids.has(centre.id) && !publishedCentreWasRemoved(centre.id)
    ),
    ...mapped,
  ];
}

export function updatePublishedCentreBasics(
  actor: CentreActor,
  id: string,
  input: import("features/universities/language-centers/types").LanguageCenterInput
) {
  const value = readWorkspace();
  const centre = value.centres.find((item) => item.id === id);
  if (!centre) throw new Error("Centre unavailable.");
  if (!["admin", "data_entry"].includes(actor.role))
    throw new Error(
      "Only Unibexs Admins and data entry can update language centres."
    );
  const nextUniversity = input.university_id || null;
  if (nextUniversity !== centre.universityId && actor.role !== "admin")
    throw new Error(
      "Only Unibexs Admins can change the university association."
    );
  const configuration = {
    ...centre.configuration,
    name: input.name,
    location: input.location,
    description: input.description,
    enabled: input.is_active,
  };
  value.centres = value.centres.map((item) =>
    item.id === id
      ? {
          ...centre,
          universityId: nextUniversity,
          type: nextUniversity ? "university_linked" : "independent",
          configuration,
        }
      : item
  );
  commit(value);
  return mergePublishedCentres([]).find((item) => item.id === id)!;
}
export function removePublishedCentre(actor: CentreActor, id: string) {
  requirePlatformAdmin(actor);
  const value = readWorkspace();
  if (!value.centres.some((centre) => centre.id === id))
    throw new Error("Centre unavailable.");
  value.centres = value.centres.filter((centre) => centre.id !== id);
  commit(value);
}
export function publishedCentreWasRemoved(id: string) {
  if (typeof window === "undefined" || !localStorage.getItem(WORKSPACE_KEY))
    return false;
  // Seeded centres absent from a saved workspace were explicitly removed.
  const seededIds = Object.keys(demoCentreConfigurations).map(
    (_, index) => `lc_${String(index + 1).padStart(3, "0")}`
  );
  return (
    seededIds.includes(id) &&
    !readWorkspace().centres.some((centre) => centre.id === id)
  );
}
