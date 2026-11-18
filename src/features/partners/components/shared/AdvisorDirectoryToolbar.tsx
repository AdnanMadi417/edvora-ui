"use client";
import { useState } from "react";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Button from "components/ub/core/buttons/Button";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import SelectField from "components/ub/forms/selection/SelectField";
import FilterButton from "components/ub/core/buttons/FilterButton";
export type AdvisorStatusFilter =
  | "active"
  | "inactive"
  | "individual"
  | "agency"
  | "unverified"
  | null;
export default function AdvisorDirectoryToolbar({
  search,
  onSearch,
  total,
  loading,
  manager = "all",
  status = null,
  managers,
  onApply,
  onClear,
}: {
  search: string;
  onSearch: (value: string) => void;
  total: number;
  loading?: boolean;
  manager?: string;
  status?: AdvisorStatusFilter;
  managers?: { value: string; label: string }[];
  onApply?: (manager: string, status: AdvisorStatusFilter) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ manager, status: status || "all" });
  const count = Number(manager !== "all") + Number(Boolean(status));
  return (
    <>
      <DataTableToolbar
        className="!mb-0"
        search={{
          value: search,
          onChange: onSearch,
          placeholder: "Search by name or email...",
        }}
        filters={
          onApply ? (
            <FilterButton
              count={count}
              onClick={() => {
                setDraft({ manager, status: status || "all" });
                setOpen(true);
              }}
            />
          ) : undefined
        }
        // The count is in the table footer; the toolbar doesn't repeat it.
        actions={
          search.trim() || count > 0 ? (
            <Button variant="tertiary" text="Clear" onClick={onClear} />
          ) : undefined
        }
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter advisors"
        description="Choose an account manager or advisor category."
        footer={
          <>
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                setDraft({ manager: "all", status: "all" });
                onApply?.("all", null);
                setOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                onApply?.(
                  draft.manager,
                  draft.status === "all"
                    ? null
                    : (draft.status as AdvisorStatusFilter)
                );
                setOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <SelectField
            label="Account manager"
            field="manager"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All managers" },
              ...(managers || []),
            ]}
          />
          <SelectField
            label="Advisor category"
            field="status"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All advisors" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Suspended" },
              { value: "individual", label: "Individual" },
              { value: "agency", label: "Company" },
              { value: "unverified", label: "Awaiting review" },
            ]}
          />
        </div>
      </Drawer>
    </>
  );
}
