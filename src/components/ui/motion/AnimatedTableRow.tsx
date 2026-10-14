"use client";

import React from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";

/**
 * Shared fade in/out + the transition every animated row list uses — the
 * one place to retune filter/sort row animations everywhere at once.
 * Reuses the app's shared EASE/MICRO_DURATION (see FadeIn.tsx) by default,
 * so row animations feel like the same system as tabs/dropdowns rather
 * than their own thing — override here, not per screen, if that ever needs
 * to diverge.
 */
export const ROW_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
export const ROW_TRANSITION: Transition = { duration: MICRO_DURATION, ease: EASE };

type AnimatedTableRowProps = React.ComponentProps<typeof motion.tr>;

/**
 * Drop-in replacement for <tr> in any filter/sort-driven table: fades in
 * on mount, fades out on unmount, and smoothly reorders (via `layout`)
 * when its position in the list changes — instead of rows jumping
 * instantly when a filter, sort, or page change reshuffles the list.
 *
 * Render it inside a plain <AnimatePresence> (default mode — NOT
 * "popLayout") for exit animations to play. popLayout pops an exiting
 * element out of flow with `position: absolute`, which per the CSS spec
 * forces it to `display: block` — for a <tr> that means it stops being a
 * table row mid-animation, breaking column alignment (verified: every
 * exiting row measured `position: absolute; display: block` instead of
 * `table-row`). Default mode leaves the exiting row in normal flow until
 * it's actually removed, so it just fades in place and the reflow after
 * is handled by the remaining rows' own `layout` transform — safe for
 * real table rows. Give each row a stable `key` (its id, never its array
 * index) — that's what lets framer-motion tell "this row moved" apart
 * from "this row left and a different one arrived" across a filter/sort
 * change.
 *
 * Not table-specific beyond rendering a <tr> — a future non-table list
 * (e.g. a card-based screen) can reuse ROW_VARIANTS/ROW_TRANSITION
 * directly on its own motion.* element instead of this component, and can
 * use popLayout safely there since div/flex elements don't blockify.
 */
export default function AnimatedTableRow({ children, ...props }: AnimatedTableRowProps) {
  return (
    <motion.tr layout variants={ROW_VARIANTS} initial="initial" animate="animate" exit="exit" transition={ROW_TRANSITION} {...props}>
      {children}
    </motion.tr>
  );
}
