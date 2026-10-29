// <Icon name size /> wrapper (docs/unibexs-frontend-redesign-brief.md §4.8,
// §11.6). Backed by lucide-react for now; swapping the set to Iconoir is a
// change to ICONS below only — callers keep using names.
import React from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileText,
  GraduationCap,
  Globe,
  House,
  Info,
  Landmark,
  ListFilter,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  back: ArrowLeft,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  check: Check,
  "check-circle": CircleCheck,
  close: X,
  plus: Plus,
  minus: Minus,
  search: Search,
  bell: Bell,
  user: User,
  users: Users,
  home: House,
  file: File,
  "file-text": FileText,
  upload: Upload,
  download: Download,
  calendar: Calendar,
  clock: Clock,
  "shield-check": ShieldCheck,
  "alert-triangle": TriangleAlert,
  "alert-circle": CircleAlert,
  info: Info,
  eye: Eye,
  "eye-off": EyeOff,
  edit: Pencil,
  trash: Trash2,
  more: Ellipsis,
  filter: ListFilter,
  sort: ArrowUpDown,
  mail: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  building: Building2,
  institution: Landmark,
  graduation: GraduationCap,
  wallet: Wallet,
  globe: Globe,
  logout: LogOut,
  settings: Settings,
  "external-link": ExternalLink,
  copy: Copy,
  menu: Menu,
  star: Star,
  "map-pin": MapPin,
  send: Send,
  spinner: LoaderCircle,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
export type IconSize = 16 | 20 | 24 | 32;

/** Every registered icon name, for galleries and pickers. */
export const iconNames = Object.keys(ICONS) as IconName[];

// Directional glyphs flip under dir="rtl" (brief §4.8). Checks, clocks,
// media controls and the logo never do. Vertical arrows stay put.
const DIRECTIONAL = new Set<IconName>([
  "arrow-left",
  "arrow-right",
  "back",
  "chevron-left",
  "chevron-right",
  "send",
  "external-link",
  "logout",
]);

const SIZE_CLASS: Record<IconSize, string> = {
  16: "h-4 w-4",
  20: "h-5 w-5",
  24: "h-6 w-6",
  32: "h-8 w-8",
};

export type IconProps = {
  name: IconName;
  /** 16 inline/tags · 20 buttons, inputs, nav (default) · 24 standalone · 32 empty states. */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  /** Override the automatic RTL mirroring for directional names. */
  mirrorInRtl?: boolean;
  className?: string;
};

export function Icon({ name, size = 20, label, mirrorInRtl, className = "" }: IconProps) {
  const Glyph = ICONS[name];
  const mirror = mirrorInRtl ?? DIRECTIONAL.has(name);
  return (
    <Glyph
      // 1.25px at 16, 1.5px otherwise; lucide draws on a 24 grid, so keep the stroke absolute.
      size={size}
      strokeWidth={size === 16 ? 1.25 : 1.5}
      absoluteStrokeWidth
      color="currentColor"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      className={`shrink-0 ${SIZE_CLASS[size]} ${mirror ? "rtl:-scale-x-100" : ""} ${className}`}
    />
  );
}

export default Icon;
