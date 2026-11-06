"use client";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Button from "components/ub/core/buttons/Button";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import SelectField from "components/ub/forms/selection/SelectField";
export type AdvisorStatusFilter =
  | "active"
  | "inactive"
  | "individual"
  | "agency"
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
            <Button
              variant="secondary"
              text={count ? `Filters (${count})` : "Filters"}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft({ manager, status: status || "all" });
                setOpen(true);
              }}
            />
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-3">
            {(search.trim() || count > 0) && (
              <Button variant="tertiary" text="Clear" onClick={onClear} />
            )}
            <p
              role="status"
              className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary"
            >
              {loading ? "Updating…" : `${total} advisors`}
            </p>
          </div>
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
            ]}
          />
        </div>
      </Drawer>
    </>
  );
}
