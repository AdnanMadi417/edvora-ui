import type { CentreConfiguration } from "features/universities/language-centers/configuration";
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
export interface CentreWorkspace {
  version: 1;
  centres: ManagedCentre[];
}
export interface CentreActor {
  id: string;
  role: string;
}
