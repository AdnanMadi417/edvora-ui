import type { CentreConfiguration } from "features/universities/language-centers/configuration";
export const CENTRE_ADMIN_ROLE = "language_centre_admin";
export interface CentreBranch {
  id: string;
  name: string;
  location: string;
  address: string;
}
export interface CentreAsset {
  name: string;
  url: string;
}
export interface ManagedCentre {
  id: string;
  type: "university_linked" | "independent";
  universityId: string | null;
  configuration: CentreConfiguration;
  branches: CentreBranch[];
  logo: CentreAsset | null;
  images: (CentreAsset & { id: string })[];
}
export interface CentreAdminUser {
  id: string;
  name: string;
  email: string;
  centreId: string;
  status: "invited" | "active" | "suspended" | "removed";
}
export interface CentreWorkspace {
  version: 1;
  centres: ManagedCentre[];
  users: CentreAdminUser[];
}
export interface CentreActor {
  id: string;
  role: string;
}
