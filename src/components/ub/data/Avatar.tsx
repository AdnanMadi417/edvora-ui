"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { avatarInitials } from "components/ub/recipes";

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;
export type AvatarStatus = "online" | "away" | "offline";

// Box, initials type (never below 12px) and the status dot at 25% of the diameter.
const sizeBox: Record<AvatarSize, string> = {
  24: "h-6 w-6 text-ub-caption",
  32: "h-8 w-8 text-ub-caption",
  40: "h-10 w-10 text-ub-label-md",
  48: "h-12 w-12 text-ub-label-lg",
  64: "h-16 w-16 text-ub-heading-md",
  96: "h-24 w-24 text-ub-heading-lg",
};
const dotBox: Record<AvatarSize, string> = {
  24: "h-1.5 w-1.5",
  32: "h-2 w-2",
  40: "h-2.5 w-2.5",
  48: "h-3 w-3",
  64: "h-4 w-4",
  96: "h-6 w-6",
};
const statusColor: Record<AvatarStatus, string> = {
  online: "bg-ub-tone-success-dot",
  away: "bg-ub-tone-warning-dot",
  offline: "bg-ub-tone-neutral-dot",
};
// "+N" counter: neutral so it doesn't read as another person's initials.
const overflowCircle =
  "ub-tabular grid shrink-0 place-items-center rounded-ub-full bg-ub-tone-neutral-bg font-semibold text-ub-tone-neutral-text ring-2 ring-ub-surface";
const statusText: Record<AvatarStatus, string> = { online: "Online", away: "Away", offline: "Offline" };

/** "Nur Aisyah Binti Kamal" → "NK"; single names give one letter. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface AvatarProps {
  /** Full name: used for initials and as the default alt text. */
  name: string;
  src?: string | null;
  /** Defaults to `name`. Pass "" when the name is already shown next to the avatar. */
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

/** Avatar (brief §4.7): image with an initials fallback, optional presence dot. */
export function Avatar({ name, src, alt, size = 40, status, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const showImage = !!src && !failed;
  const label = alt ?? name;

  return (
    <span className={`relative inline-flex shrink-0 ${className ?? ""}`}>
      {showImage ? (
        <span className={`${avatarInitials} ${sizeBox[size]}`}>
          <Image
            src={src}
            alt={label}
            width={size}
            height={size}
            unoptimized
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        </span>
      ) : (
        <span
          className={`${avatarInitials} ${sizeBox[size]} select-none`}
          {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
          <span aria-hidden="true">{getInitials(name)}</span>
        </span>
      )}
      {status && (
        <span
          className={`absolute bottom-0 end-0 rounded-ub-full ring-2 ring-ub-avatar-ring ${dotBox[size]} ${statusColor[status]}`}
          title={statusText[status]}
        >
          <span className="sr-only">{statusText[status]}</span>
        </span>
      )}
    </span>
  );
}

export interface AvatarGroupPerson {
  name: string;
  src?: string | null;
}

export interface AvatarGroupProps {
  people: AvatarGroupPerson[];
  /** Avatars shown before collapsing the rest into "+N". Default 4. */
  max?: number;
  size?: AvatarSize;
  /** Accessible group name, e.g. "Assigned Advisors". */
  label?: string;
  className?: string;
}

/** Overlapping avatars (−8px), at most `max`, then a "+N" counter. */
export function AvatarGroup({ people, max = 4, size = 32, label = "People", className }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const hidden = people.length - visible.length;
  return (
    <div role="group" aria-label={label} className={`flex items-center ${className ?? ""}`}>
      {visible.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} src={p.src} size={size} className={`rounded-ub-full ring-2 ring-ub-surface ${i > 0 ? "-ms-2" : ""}`} />
      ))}
      {hidden > 0 && (
        <span
          role="img"
          aria-label={`${hidden} more`}
          title={people.slice(max).map((p) => p.name).join(", ")}
          className={`${overflowCircle} ${sizeBox[size]} -ms-2`}
        >
          <span aria-hidden="true">+{hidden}</span>
        </span>
      )}
    </div>
  );
}

export default Avatar;
