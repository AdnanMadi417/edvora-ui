"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

interface NotificationAvatarProps {
  /** Already-resolved, directly renderable image URL (student photo, partner
   *  photo, agency logo) — not a storage key, so this renders a plain <img>
   *  rather than going through PresignedImage's fetch-and-resolve flow. */
  photoUrl?: string | null;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  badgeBg: string;
  /** "md" for the full notifications list, "sm" for the bell preview popover. */
  size?: "md" | "sm";
}

const SIZES = {
  md: { box: "h-11 w-11", icon: "h-5 w-5", badge: "h-4 w-4", badgeIcon: "h-2.5 w-2.5" },
  sm: { box: "h-9 w-9", icon: "h-4 w-4", badge: "h-3.5 w-3.5", badgeIcon: "h-2 w-2" },
};

/**
 * The notification's status/type icon square — or, when a photo/logo URL is
 * present (student photo, partner photo, agency logo), a circular avatar
 * with that same icon moved into a small corner badge instead. Falls back
 * to the plain icon square whenever there's no URL, or the image fails to
 * load, so a placeholder is always shown rather than a blank space.
 */
export default function NotificationAvatar({
  photoUrl,
  icon: Icon,
  bg,
  iconColor,
  badgeBg,
  size = "md",
}: NotificationAvatarProps) {
  const [broken, setBroken] = useState(false);
  const s = SIZES[size];

  if (!photoUrl || broken) {
    return (
      <div className={`flex ${s.box} shrink-0 items-center justify-center rounded-md ${bg}`}>
        <Icon className={`${s.icon} ${iconColor}`} />
      </div>
    );
  }

  return (
    <div className={`relative ${s.box} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt=""
        className="h-full w-full rounded-full object-cover ring-1 ring-slate-100"
        onError={() => setBroken(true)}
      />
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex ${s.badge} items-center justify-center rounded-full ring-2 ring-white ${badgeBg}`}
      >
        <Icon className={`${s.badgeIcon} text-white`} />
      </span>
    </div>
  );
}
