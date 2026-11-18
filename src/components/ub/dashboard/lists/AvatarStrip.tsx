"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconButton from "components/ub/core/buttons/IconButton";
import { Avatar } from "components/ub/data/media/Avatar";
import { entityStatusOf } from "components/ub/data/badges/EntityStatusBadge";
import { focusRing } from "components/ub/recipes";

export interface AvatarStripPerson {
  id: string;
  name: string;
  /** One short line under the name: type, country, role… */
  subtitle?: string;
  avatarSrc?: string | null;
  /** Backend value (active, unverified…); shown as the small circle on the avatar. */
  status?: string | boolean | null;
  /** Word for the circle's tooltip, e.g. "Pending verification". */
  statusLabel?: string;
  href?: string;
  /** Accessible name for the link, e.g. "Open advisor: Global Pathways". */
  ariaLabel?: string;
}

export interface AvatarStripProps {
  people: AvatarStripPerson[];
  /** Accessible name, e.g. "Advisors awaiting review". */
  label: string;
  className?: string;
}

const DOT = { active: "bg-ub-tone-success-dot", inactive: "bg-ub-tone-neutral-dot", pending: "bg-ub-tone-warning-dot" } as const;
const WORD = { active: "Active", inactive: "Inactive", pending: "Pending" } as const;

/**
 * People in a row you can scroll (snap per person): a 64px avatar with the
 * status circle, the name and one short line, each opening the profile.
 * Previous / next buttons on the end scroll by a page and hide at the ends.
 */
export default function AvatarStrip({ people, label, className }: AvatarStripProps) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const scrolled = Math.abs(el.scrollLeft);
      setEdges({ start: scrolled < 4, end: scrolled + el.clientWidth >= el.scrollWidth - 4 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [people.length]);

  const page = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={clsx("relative flex min-w-0 items-center gap-2", className)}>
      <ul ref={track} aria-label={label} className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]">
        {people.map((p) => {
          const tone = p.status === undefined ? null : entityStatusOf(p.status);
          const body = (
            <>
              <span className="relative">
                <Avatar name={p.name} src={p.avatarSrc ?? undefined} size={64} alt="" />
                {tone && (
                  <span title={p.statusLabel ?? WORD[tone]} className={clsx("absolute bottom-0.5 end-0.5 h-3.5 w-3.5 rounded-ub-full ring-2 ring-ub-avatar-ring", DOT[tone])}>
                    <span className="sr-only">{p.statusLabel ?? WORD[tone]}</span>
                  </span>
                )}
              </span>
              <span title={p.name} className="mt-2 line-clamp-2 w-full break-words text-ub-label-md text-ub-text-primary">
                {p.name}
              </span>
              {p.subtitle && (
                <span title={p.subtitle} className="w-full truncate text-ub-caption text-ub-text-tertiary">
                  {p.subtitle}
                </span>
              )}
            </>
          );
          const cell = "flex w-28 shrink-0 flex-col items-center rounded-ub-md px-2 py-2 text-center";
          return (
            <li key={p.id} className="snap-start">
              {p.href ? (
                <Link href={p.href} aria-label={p.ariaLabel} className={clsx(cell, "hover:bg-ub-surface-subtle", focusRing)}>
                  {body}
                </Link>
              ) : (
                <span className={cell}>{body}</span>
              )}
            </li>
          );
        })}
      </ul>
      {!(edges.start && edges.end) && (
        <div className="flex shrink-0 flex-col gap-2">
          {!edges.start && (
            <IconButton variant="secondary" size="sm" onClick={() => page(-1)} aria-label={`Show previous: ${label}`} title="Previous" icon={<ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />} />
          )}
          {!edges.end && (
            <IconButton variant="secondary" size="sm" onClick={() => page(1)} aria-label={`Show more: ${label}`} title="More" icon={<ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />} />
          )}
        </div>
      )}
    </div>
  );
}
