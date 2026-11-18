"use client";

import { Suspense } from "react";
import Applications from "features/applications/account-manager/components/table/ManagerApplications";

export default function AccountManagerApplicationsPage() {
  return (
    // The list reads ?stage= from the URL (Commission menu item).
    <Suspense fallback={null}>
      <Applications />
    </Suspense>
  );
}
