// Shared class recipes for the Unibexs design system
// (docs/unibexs-frontend-redesign-brief.md §2–§4). Every reusable component
// composes these so buttons, fields, tags and surfaces look identical
// everywhere. Semantic and tone tokens only (no raw hex, no legacy palette),
// so every recipe follows data-ub-theme into dark mode automatically.

/** 2px focus ring with 2px offset (brief §9). Never removed. */
export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus";

/** Same ring drawn inside the element, for controls flush against an edge. */
export const focusRingInset = "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ub-border-focus";

const transition = "transition-[background-color,border-color,color,box-shadow] duration-ub-fast ease-ub-standard";

// ── Buttons (brief §4.1): all pills; sm 32 · md 40 · lg 48 ────────────────

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "positive" | "destructive" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonBase =
  `inline-flex min-w-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-ub-full font-medium ${transition} ${focusRing} ` +
  "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-ub-action-disabled-bg disabled:text-ub-action-disabled-text disabled:shadow-none";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ub-action-primary text-ub-action-primary-text hover:bg-ub-action-primary-hover active:bg-ub-action-primary-pressed",
  secondary:
    "border-ub-strong border-ub-action-secondary bg-ub-surface text-ub-action-secondary-text hover:bg-ub-action-secondary-hover hover:shadow-ub-xs active:bg-ub-action-secondary-pressed",
  tertiary: "text-ub-text-link hover:bg-ub-action-secondary-hover active:bg-ub-action-secondary-pressed",
  positive: "bg-ub-success-600 text-ub-text-on-action hover:bg-ub-success-700 active:bg-ub-success-800",
  // Filled destructive only inside confirmation dialogs (brief §4.1).
  destructive: "bg-ub-danger-600 text-ub-text-on-action hover:bg-ub-danger-700 active:bg-ub-danger-800",
  inverse: "bg-ub-action-inverse text-ub-action-inverse-text hover:bg-ub-action-inverse-hover active:bg-ub-blue-100",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-ub-label-md",
  md: "h-10 px-4 text-ub-label-md",
  lg: "h-12 px-6 text-ub-label-lg",
};

/** Circular icon buttons: 32 / 40 / 48 (brief §4.1). Always give them an aria-label. */
export const iconButtonSizes: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

/** Outlined secondary-style destructive action (outside dialogs). */
export const buttonDangerOutline =
  "border border-ub-tone-danger-border bg-ub-surface text-ub-tone-danger-text hover:border-ub-danger-500 hover:bg-ub-tone-danger-bg active:bg-ub-tone-danger-bg";

// ── Form fields (brief §4.2) ─────────────────────────────────────────────

export const fieldWrapper = "mb-4";
export const fieldLabel = "mb-1.5 block text-ub-label-md text-ub-text-primary";
/** Rendered after the label of optional fields instead of a required asterisk. */
export const fieldOptional = "font-normal text-ub-text-tertiary";
export const fieldHelper = "mt-1.5 text-ub-body-sm text-ub-text-tertiary";
export const fieldError = "mt-1.5 flex items-start gap-1.5 text-ub-body-sm text-ub-tone-danger-text";

/** Text input / select / textarea. Height 48 on mobile, 40 from md up. */
export const fieldControl =
  `w-full rounded-ub-md border border-ub-border-control bg-ub-surface px-3 text-ub-body-md text-ub-text-primary ${transition} ` +
  "placeholder:text-ub-text-tertiary hover:border-ub-border-control-hover " +
  "focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus " +
  "disabled:cursor-not-allowed disabled:border-ub-border disabled:bg-ub-disabled disabled:text-ub-text-disabled";
export const fieldControlHeight = "h-12 md:h-10";
export const fieldControlError = "border-ub-danger-500 hover:border-ub-danger-500 focus:border-ub-danger-500 focus:ring-ub-danger-500";

/** 20px checkbox, radius 4 (brief §4.2). */
export const checkbox =
  `h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-ub-xs border border-ub-border-control bg-ub-surface ${transition} ${focusRing} ` +
  "checked:border-ub-action-primary checked:bg-ub-action-primary disabled:cursor-not-allowed disabled:bg-ub-disabled";

/** Selectable option chip / card (radio cards, check chips). */
export const optionCard = `rounded-ub-md border border-ub-border bg-ub-surface ${transition} hover:border-ub-border-hover`;
export const optionCardSelected = "border-2 border-ub-action-primary bg-ub-selected";

/** 40×24 toggle track + 20px thumb (brief §4.2). */
export const toggleTrack = (on: boolean) =>
  `relative inline-flex h-6 w-10 shrink-0 items-center rounded-ub-full ${transition} ${focusRing} ${on ? "bg-ub-action-primary" : "bg-ub-toggle-off"}`;
export const toggleThumb = (on: boolean) =>
  `inline-block h-5 w-5 rounded-ub-full bg-white shadow-ub-sm transition-transform duration-ub-fast ease-ub-standard ${on ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-0.5 rtl:-translate-x-0.5"}`;

/** Dashed 1.5px dropzone, radius 12 (brief §4.2). */
export const dropzone = `rounded-ub-lg border-ub-strong border-dashed border-ub-border-control bg-ub-surface-subtle ${transition} hover:border-ub-border-focus hover:bg-ub-selected`;
export const dropzoneActive = "border-ub-border-focus bg-ub-selected";

/** Pill search field (brief §5). */
export const searchField =
  `h-10 w-full rounded-ub-full border border-ub-border-control bg-ub-surface ps-10 pe-4 text-ub-body-sm text-ub-text-primary ${transition} ` +
  "placeholder:text-ub-text-tertiary hover:border-ub-border-control-hover focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus";

// ── Tags and badges (brief §4.3): 6px radius, never pills ────────────────

export type TagTone = "success" | "danger" | "warning" | "attention" | "info" | "neutral" | "brand";

export const tagBase = "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-ub-sm border px-2 text-ub-label-sm";
export const tagSm = "h-5 px-1.5";

/** Tinted tags: 700 text on 50 with a 200 border; warning uses 800 text. */
// Tone tokens switch with data-ub-theme, so tags read correctly on navy too.
export const tagTones: Record<TagTone, string> = {
  success: "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text",
  danger: "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text",
  warning: "border-ub-tone-warning-border bg-ub-tone-warning-bg text-ub-tone-warning-text",
  attention: "border-ub-tone-attention-border bg-ub-tone-attention-bg text-ub-tone-attention-text",
  info: "border-ub-tone-info-border bg-ub-tone-info-bg text-ub-tone-info-text",
  neutral: "border-ub-tone-neutral-border bg-ub-tone-neutral-bg text-ub-tone-neutral-text",
  brand: "border-ub-tone-brand-border bg-ub-tone-brand-bg text-ub-tone-brand-text",
};

/** Solid fills: white on 600 (success/danger/info/brand), navy on warning-500. */
export const tagSolidTones: Record<TagTone, string> = {
  success: "border-transparent bg-ub-success-600 text-ub-text-on-action",
  danger: "border-transparent bg-ub-danger-600 text-ub-text-on-action",
  warning: "border-transparent bg-ub-warning-500 text-ub-navy",
  attention: "border-transparent bg-ub-tag-orange-solid text-ub-navy",
  info: "border-transparent bg-ub-info-600 text-ub-text-on-action",
  neutral: "border-transparent bg-ub-neutral-600 text-ub-text-on-action",
  brand: "border-transparent bg-ub-blue-600 text-ub-text-on-action",
};

/** 6px status dot colour per tone. */
export const tagDot: Record<TagTone, string> = {
  success: "bg-ub-tone-success-dot",
  danger: "bg-ub-tone-danger-dot",
  warning: "bg-ub-tone-warning-dot",
  attention: "bg-ub-tone-attention-dot",
  info: "bg-ub-tone-info-dot",
  neutral: "bg-ub-tone-neutral-dot",
  brand: "bg-ub-tone-brand-dot",
};

// ── Surfaces (brief §3, §4.4) ────────────────────────────────────────────

/** Resting card: border, no shadow, radius 12, padding 24 (16 on mobile). */
export const card = "rounded-ub-lg border border-ub-border bg-ub-surface";
export const cardPadding = "p-4 md:p-6";
export const cardInteractive = `${transition} hover:border-ub-border-hover hover:shadow-ub-sm`;
export const cardSelected = "border-2 border-ub-action-primary bg-ub-selected";

/** Floating layers. */
export const popover = "rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-md";
export const menuItem = `flex h-10 w-full items-center gap-2 rounded-ub-md px-3 text-start text-ub-body-sm text-ub-text-primary ${transition} hover:bg-ub-surface-subtle ${focusRingInset}`;
export const modalPanel = "rounded-ub-xl bg-ub-surface shadow-ub-xl";
export const scrim = "bg-ub-scrim";

/** Data table container (brief §4.6). */
export const tableContainer = "overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface";
export const tableScroll = "overflow-x-auto";
export const tableHead = "bg-ub-table-head text-ub-label-sm text-ub-text-secondary";
export const tableHeadCell = "h-11 px-4 text-start font-medium";
export const tableRow = "border-t border-ub-border";
export const tableCell = "h-14 px-4 text-ub-body-sm text-ub-text-primary";

// ── Feedback (brief §4.7) ────────────────────────────────────────────────

export const skeleton = "animate-pulse rounded-ub-md bg-ub-skeleton motion-reduce:animate-none";
export const progressTrack = "h-2 w-full overflow-hidden rounded-ub-full bg-ub-disabled";
export const progressFill = "h-full rounded-ub-full bg-ub-action-primary transition-[width] duration-ub-slow ease-ub-standard";
export const tooltip = "pointer-events-none max-w-[280px] rounded-ub-md bg-ub-tooltip px-3 py-2 text-ub-body-sm text-white shadow-ub-md";

/** Empty state: 32px icon in a 64px blue-50 circle, heading-md, one sentence. */
export const emptyIconCircle = "grid h-16 w-16 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-icon-interactive";
export const emptyTitle = "text-ub-heading-md text-ub-text-primary";
export const emptyBody = "max-w-ub-reading text-ub-body-md text-ub-text-secondary";

/** Inline alert (tinted background + border + 20px icon). */
export const alertTones: Record<"success" | "danger" | "warning" | "info", string> = {
  success: tagTones.success,
  danger: tagTones.danger,
  warning: tagTones.warning,
  info: tagTones.info,
};

// ── Navigation ───────────────────────────────────────────────────────────

/** Tabs: height 44, 2px blue-600 underline (brief §4.7). */
export const tabList = "flex gap-1 overflow-x-auto border-b border-ub-border";
export const tab = (active: boolean) =>
  `-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-ub-label-md ${transition} ${focusRingInset} ` +
  (active ? "border-ub-border-focus text-ub-text-link" : "border-transparent text-ub-text-secondary hover:text-ub-text-primary");

/** Avatar initials: blue-700 on blue-50 (brief §4.7). */
export const avatarInitials = "grid shrink-0 place-items-center overflow-hidden rounded-ub-full bg-ub-tone-brand-bg font-semibold text-ub-tone-brand-text";

/** Icon tints for small icon badges (SectionIconBadge, stat cards). */
export const iconTints = {
  blue: "bg-ub-tone-brand-bg text-ub-tone-brand-text",
  green: "bg-ub-tone-success-bg text-ub-tone-success-text",
  amber: "bg-ub-tone-warning-bg text-ub-tone-warning-text",
  red: "bg-ub-tone-danger-bg text-ub-tone-danger-text",
  violet: "bg-ub-tone-plum-bg text-ub-tone-plum-text",
  slate: "bg-ub-tone-neutral-bg text-ub-tone-neutral-text",
  emerald: "bg-ub-tone-teal-bg text-ub-tone-teal-text",
  rose: "bg-ub-tone-pink-bg text-ub-tone-pink-text",
  cyan: "bg-ub-tone-sky-bg text-ub-tone-sky-text",
} as const;
