/** Portal footer: one quiet copyright line under the page content (plain text; it links nowhere). */
const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-2 py-3 md:border-t md:border-ub-border md:py-6 xl:flex-row">
      <p className="text-center text-[11px] text-ub-text-tertiary md:text-ub-body-sm">
        ©{new Date().getFullYear()}{" "}
        <span className="font-medium text-ub-text-secondary">Unibexs</span>
        <span className="hidden sm:inline">. All rights reserved.</span>
      </p>
    </footer>
  );
};

export default Footer;
