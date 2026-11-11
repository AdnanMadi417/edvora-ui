"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";

interface NotificationAvatarProps {
  /** Raw storage key (student photo, partner photo, agency logo) — resolved
   *  to a signed URL the same way every other photo in this app is
   *  (PresignedImage's own fetch pattern, replicated here rather than
   *  reused directly so the corner badge can be shown/hidden correctly in
   *  both the "no photo" and "presign failed" cases). */
  photoKey?: string | null;
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
 * The notification's status/type icon square — or, when the photo/logo key
 * resolves to a real signed URL, a circular avatar with that same icon
 * moved into a small corner badge instead. Falls back to the plain icon
 * square whenever there's no key, presigning fails, or the image itself
 * fails to load, so a placeholder is always shown rather than a blank space.
 */
export default function NotificationAvatar({
  photoKey,
  icon: Icon,
  bg,
  iconColor,
  badgeBg,
  size = "md",
}: NotificationAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const s = SIZES[size];

  useEffect(() => {
    setSrc(null);
    setBroken(false);
    if (!photoKey) return;
    let cancelled = false;
    getDocumentDownloadUrl(photoKey)
      .then((url) => { if (!cancelled) setSrc(url); })
      .catch(() => { if (!cancelled) setBroken(true); });
    return () => {
      cancelled = true;
    };
  }, [photoKey]);

  if (!photoKey || broken || !src) {
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
        src={src}
        alt=""
        className="h-full w-full rounded-full object-cover ring-1 ring-ub-border"
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
