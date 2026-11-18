import { TextButton } from "components/ub/core/buttons/TextButton";

export interface ListFooterProps {
  shown: number;
  total: number;
  /** "View all" opens the filtered list… */
  viewAllHref?: string;
  /** …or the list expands in place when the API can't filter it. */
  onToggle?: () => void;
  expanded?: boolean;
  /** Names the list for the link, e.g. "View all: Stuck applications". */
  label: string;
}

/**
 * The one footer for every dashboard list: "Showing 3 of N" on the start, one
 * control on the end (View all, or Show all / Show fewer). The card has no
 * other "view all" control.
 */
export default function ListFooter({ shown, total, viewAllHref, onToggle, expanded = false, label }: ListFooterProps) {
  const touch = "[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11";
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="ub-tabular text-ub-caption text-ub-text-tertiary">
        Showing {shown.toLocaleString()} of {total.toLocaleString()}
      </p>
      {onToggle ? (
        total > shown || expanded ? (
          <TextButton size="sm" className={touch} onClick={onToggle}>
            {expanded ? "Show fewer" : `Show all ${total.toLocaleString()}`}
          </TextButton>
        ) : null
      ) : (
        viewAllHref && (
          <TextButton size="sm" href={viewAllHref} aria-label={`View all: ${label}`} className={touch}>
            View all
          </TextButton>
        )
      )}
    </div>
  );
}
