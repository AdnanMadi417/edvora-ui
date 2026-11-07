import clsx from "clsx";
import { focusRing } from "components/ub/recipes";

/** Portal footer: one quiet copyright line under the page content. */
const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-2 py-3 md:border-t md:border-ub-border md:py-6 xl:flex-row">
      <p className="text-center text-[11px] text-ub-text-tertiary md:text-ub-body-sm">
        ©{new Date().getFullYear()}{" "}
        <a
          href="#"
          className={clsx(
            "rounded-ub-xs font-medium text-ub-text-secondary underline-offset-2 transition-colors duration-ub-fast hover:text-ub-text-link hover:underline",
            focusRing,
          )}
        >
          Unibexs
        </a>
        <span className="hidden sm:inline">. All rights reserved.</span>
      </p>
    </footer>
  );
};

export default Footer;
