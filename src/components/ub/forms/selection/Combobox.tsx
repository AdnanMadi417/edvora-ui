"use client";
import { forwardRef } from "react";
import SearchableSelectButton, {
  type SelectOption,
  type SingleSelectProps,
} from "./SearchableSelectButton";
export type ComboboxOption = SelectOption;
export type ComboboxProps = SingleSelectProps;
/** Backwards-compatible single-select API over the shared searchable button. */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(props, ref) {
    return <SearchableSelectButton {...props} ref={ref} />;
  }
);
export default Combobox;
