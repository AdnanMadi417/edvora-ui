"use client";

import type { AccountManager } from "../../types";
import AccountManagerPartnersTable from "../AccountManagerPartnersTable";
import AccountManagerProfile from "../AccountManagerProfile";

interface Props {
  manager: AccountManager;
  /** Refetch the manager after an advisor transfer. */
  onManagerChanged?: () => void;
}

export default function AccountManagerDetailsTabs({
  manager,
  onManagerChanged,
}: Props) {
  return (
    <div className="min-w-0">
      <AccountManagerProfile manager={manager} editable />
      <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
        <AccountManagerPartnersTable
          manager={manager}
          onTransferred={onManagerChanged}
        />
      </section>
    </div>
  );
}
