"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";

function useOutsideAlerter(ref: React.RefObject<HTMLElement>, setX: (open: boolean) => void): void {
  React.useEffect(() => {
    // Close on a click outside the wrapper, or on Esc (brief §9).
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setX(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setX(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ref, setX]);
}

/**
 * Headless dropdown: the caller styles the panel through `classNames`
 * (use the `popover` recipe from components/ui/ub/recipes for the
 * design-system look — radius 12 + shadow-md). The panel grows from the
 * top-end corner so it mirrors correctly in RTL.
 */
const Dropdown = (props: {
  button: JSX.Element;
  children: JSX.Element;
  classNames: string;
}) => {
  const { button, children, classNames } = props;
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [openWrapper, setOpenWrapper] = React.useState(false);
  const reduceMotion = useReducedMotion();
  useOutsideAlerter(wrapperRef, setOpenWrapper);

  return (
    <div ref={wrapperRef} className="relative flex">
      <div className="flex" onMouseDown={() => setOpenWrapper(!openWrapper)}>
        {button}
      </div>
      <AnimatePresence>
        {openWrapper && (
          <motion.div
            className={`${classNames} absolute z-10 ltr:origin-top-right rtl:origin-top-left`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : MICRO_DURATION, ease: EASE }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
