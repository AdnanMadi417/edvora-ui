import type { SelectOption } from "./SearchableSelectButton";
export type LegacySelectOption =
  | string
  | number
  | boolean
  | {
      value?: string | number | boolean;
      label?: string;
      id?: string;
      name?: string;
      disabled?: boolean;
    };
export function normalizeSelectOptions(
  options: LegacySelectOption[] = []
): SelectOption[] {
  return options.map((option) =>
    typeof option === "object" && option !== null
      ? {
          ...option,
          value: String(option.value ?? option.name ?? option.id ?? ""),
          label: String(
            option.label ?? option.name ?? option.value ?? option.id ?? ""
          ),
        }
      : { value: String(option), label: String(option) }
  );
}
export const nestedSelectValue = (
  data: Record<string, any>,
  field: string
): any =>
  field
    ?.split(/[.[\]]/)
    .filter(Boolean)
    .reduce((value, key) => value?.[key], data);
