import Link from "next/link";
import { site } from "lib/content";

/** Wordmark placeholder until SVG logos arrive (brief §11.8). */
export default function Logo() {
  return (
    <Link
      href={site.path}
      className="inline-flex items-center gap-2 rounded-ub-md text-ub-heading-sm text-ub-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ub-border-focus"
    >
      <span aria-hidden className="ub-notch-sm grid h-8 w-8 place-items-center rounded-ub-md bg-ub-action-primary text-ub-label-md text-ub-action-primary-text">
        U
      </span>
      {site.name}
    </Link>
  );
}
