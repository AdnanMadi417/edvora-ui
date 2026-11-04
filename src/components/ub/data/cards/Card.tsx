import { card } from "components/ub/recipes";

/**
 * Base card (brief §4.4): surface fill, 1px border, radius 12, no resting
 * shadow. Padding stays with the caller (`extra`) for backwards
 * compatibility. `variant="interactive"` adds the hover border + shadow-sm,
 * `variant="selected"` the 2px brand border on the selected fill.
 */
function Card(props: {
  variant?: string;
  extra?: string;
  children?: JSX.Element | any[];
  [x: string]: any;
}) {
  // `default` was a legacy shadow switch; cards no longer rest on a shadow.
  const { variant, extra, children, default: _legacyDefault, ...rest } = props;
  const variantClass =
    variant === "interactive"
      ? "transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard hover:border-ub-border-hover hover:shadow-ub-sm"
      : variant === "selected"
        ? "border-2 border-ub-action-primary bg-ub-selected"
        : "";
  return (
    <div
      className={`relative flex flex-col bg-clip-border text-ub-text-primary ${card} ${variantClass} ${extra ?? ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
