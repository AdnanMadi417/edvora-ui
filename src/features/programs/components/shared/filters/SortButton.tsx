"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import { focusRing } from "components/ub/recipes";
interface Option {
  label: string;
  value: string;
}
const SORT_OPTIONS: Option[] = [
  { label: "Commission: High → Low", value: "commission_desc" },
  { label: "Commission: Low → High", value: "commission_asc" },
  { label: "Tuition: Low → High", value: "tuition_asc" },
  { label: "Tuition: High → Low", value: "tuition_desc" },
];

interface SortButtonProps {
  value: string;
  onChange: (value: string) => void;
}
export default function SortButton({ value, onChange }: SortButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <>
      <Button
        variant="secondary"
        text={value === "all" ? "Sort" : "Sort (1)"}
        icon={<ArrowUpDown className="h-4 w-4" />}
        onClick={() => {
          setDraft(value);
          setOpen(true);
        }}
        className="min-h-[44px]"
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Sort programs"
        description="Choose the order of your program results."
        footer={
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              variant="secondary"
              text="Cancel"
              onClick={() => setOpen(false)}
            />
            <Button
              variant="primary"
              text="Apply sort"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Sort order</legend>
          {[{ value: "all", label: "Default order" }, ...SORT_OPTIONS].map(
            (option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-ub-md border p-4 transition-colors duration-200 motion-reduce:transition-none text-ub-label-md ${
                  draft === option.value
                    ? "border-ub-border-focus bg-ub-selected text-ub-text-selected"
                    : "border-ub-border text-ub-text-primary"
                }`}
              >
                <input
                  type="radio"
                  name="program-sort"
                  value={option.value}
                  checked={draft === option.value}
                  onChange={() => setDraft(option.value)}
                  className={`h-4 w-4 accent-ub-action-primary ${focusRing}`}
                />
                {option.label}
              </label>
            )
          )}
        </fieldset>
      </Drawer>
    </>
  );
}
