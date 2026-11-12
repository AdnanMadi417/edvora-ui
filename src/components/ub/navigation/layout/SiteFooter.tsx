"use client";

import { type ComponentType } from "react";
import {
  TbBrandFacebook,
  TbBrandTiktok,
  TbBrandInstagram,
  TbBrandX,
  TbBrandYoutube,
  TbBrandLinkedin,
} from "react-icons/tb";
import clsx from "clsx";
import Logo from "components/ub/brand/Logo";
import { focusRing, iconButtonSizes } from "components/ub/recipes";

const footerLink = clsx(
  // -my-1 py-1: a 24px+ tap area (WCAG 2.5.8) without moving the text.
  "-my-1 inline-block rounded-ub-xs py-1 text-ub-body-sm text-ub-text-secondary transition-colors duration-ub-fast hover:text-ub-text-link hover:underline",
  focusRing,
);

interface FooterLink {
  label: string;
  /** Real marketing-site URL, once known — "#" until this is wired up. */
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const SITE_URL = "https://unibexs.com";

// Hrefs verified directly against unibexs.com's real footer (fetched
// and checked, not guessed); labels are sentence-cased per brief §8. Note: the real site itself points both "Contact
// Us" and "Partner Success" at the same /partner-success page — confirmed
// via two independent fetches, not an extraction error on our end.
const LINK_COLUMNS: FooterColumn[] = [
  {
    heading: "Partners",
    links: [
      { label: "Advisors", href: `${SITE_URL}/partners/advisors` },
      { label: "Institutions", href: `${SITE_URL}/partners/institutions` },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Knowledge Hub", href: `${SITE_URL}/solution/knowledge-hub` },
      { label: "Application Tracker", href: `${SITE_URL}/solution/application-tracker` },
      { label: "Logistics Marketplace", href: `${SITE_URL}/solution/logistics-marketplace` },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: `${SITE_URL}/about` },
      { label: "Careers", href: `${SITE_URL}/careers` },
      { label: "Contact us", href: `${SITE_URL}/partner-success` },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog and news", href: `${SITE_URL}/blog` },
      { label: "Resource Library", href: `${SITE_URL}/resource-library` },
      { label: "Advisor Academy", href: `${SITE_URL}/advisor-academy` },
      { label: "Proven Journeys", href: `${SITE_URL}/success-stories` },
      { label: "Partner Success", href: `${SITE_URL}/partner-success` },
      { label: "Support Hub", href: `${SITE_URL}/support-hub` },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy policy", href: `${SITE_URL}/privacy-policy` },
  { label: "Terms of service", href: `${SITE_URL}/terms-of-service` },
  { label: "Partner code of conduct", href: `${SITE_URL}/partner-code-of-conduct` },
  { label: "Cookie policy", href: `${SITE_URL}/cookie-policy` },
];

const SOCIAL_LINKS: { label: string; href: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Facebook", href: "https://www.facebook.com/people/Unibexs/61583448072110/", icon: TbBrandFacebook },
  { label: "TikTok", href: "https://www.tiktok.com/@unibexs", icon: TbBrandTiktok },
  { label: "Instagram", href: "https://www.instagram.com/unibexs/", icon: TbBrandInstagram },
  { label: "X", href: "https://x.com/unibexs", icon: TbBrandX },
  { label: "YouTube", href: "https://www.youtube.com/@Unibexs", icon: TbBrandYoutube },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/unibexs/posts/?feedView=all", icon: TbBrandLinkedin },
];

interface SiteFooterProps {
  className?: string;
}

/**
 * Standalone marketing-style footer, recreated from unibexs.com — distinct
 * from the plain "© Unibexs" footer already used across internal dashboard
 * layouts (components/footer/Footer.tsx). Meant to be dropped onto
 * public-facing pages (e.g. the partner public profile at /p/[slug]).
 */
export default function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer className={clsx("w-full border-t border-ub-border bg-ub-surface", className)}>
      <div className="mx-auto max-w-ub-marketing px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="lg:max-w-sm lg:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Logo size={28} />

            <p className="mt-4 max-w-ub-reading text-ub-body-sm text-ub-text-secondary">
              Connecting students, Advisors and Institutions to make studying abroad simple.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-12">
            {LINK_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h2 className="text-ub-label-md text-ub-text-primary">{col.heading}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLink}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-ub-border" />

        {/* Legal row, then social row below it */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLink}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={clsx(
                  "grid place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-tone-brand-text transition-[background-color,transform] duration-ub-fast ease-ub-standard hover:bg-ub-selected motion-safe:hover:-translate-y-0.5",
                  iconButtonSizes.md,
                  focusRing,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
