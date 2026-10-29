import React from "react";
import { skeleton } from "components/ub/recipes";

interface SkeletonProps {
  /** Size/shape via utility classes, e.g. "h-4 w-32" or "h-10 w-10 rounded-ub-full". */
  className?: string;
}

/**
 * A single pulsing placeholder block (brief §4.7: skeleton fill, pulse off
 * under reduced motion). Compose several of these into a layout that
 * mirrors the real content's final shape (same grid, same label/value
 * pairs, same row count) so loading doesn't cause layout shift when the
 * data arrives — don't just drop one in as a generic spinner substitute.
 */
export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`${skeleton} ${className}`} />;
}
