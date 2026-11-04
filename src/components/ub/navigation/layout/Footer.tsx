import clsx from "clsx";
import { focusRing } from "components/ub/recipes";

/** Portal footer: one quiet copyright line under the page content. */
const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-2 border-t border-ub-border py-6 xl:flex-row">
      <p className="text-center text-ub-body-sm text-ub-text-tertiary">
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
        . All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
