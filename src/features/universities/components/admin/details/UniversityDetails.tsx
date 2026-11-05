"use client";

import UniversityProfile from "features/universities/components/shared/UniversityProfile";

export default function UniversityDetails({ id, basePath = "/admin/universities" }: { id: string; basePath?: string }) {
  return <UniversityProfile id={id} basePath={basePath} canManage />;
}
