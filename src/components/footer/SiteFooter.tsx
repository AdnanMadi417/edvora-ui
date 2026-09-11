"use client";

import { useState, type FormEvent, type ComponentType } from "react";
import {
  TbBrandFacebook,
  TbBrandTiktok,
  TbBrandInstagram,
  TbBrandX,
  TbBrandYoutube,
  TbBrandLinkedin,
} from "react-icons/tb";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

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

// Labels + hrefs verified directly against unibexs.com's real footer (fetched
// and checked, not guessed). Note: the real site itself points both "Contact
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
      { label: "About Us", href: `${SITE_URL}/about` },
      { label: "Careers", href: `${SITE_URL}/careers` },
      { label: "Contact Us", href: `${SITE_URL}/partner-success` },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog & News", href: `${SITE_URL}/blog` },
      { label: "Resource Library", href: `${SITE_URL}/resource-library` },
      { label: "Advisor Academy", href: `${SITE_URL}/advisor-academy` },
      { label: "Proven Journeys", href: `${SITE_URL}/success-stories` },
      { label: "Partner Success", href: `${SITE_URL}/partner-success` },
      { label: "Support Hub", href: `${SITE_URL}/support-hub` },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: `${SITE_URL}/privacy-policy` },
  { label: "Terms of Service", href: `${SITE_URL}/terms-of-service` },
  { label: "Partner Code of Conduct", href: `${SITE_URL}/partner-code-of-conduct` },
  { label: "Cookie Policy", href: `${SITE_URL}/cookie-policy` },
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
  /** Called with the entered email on submit. Left unwired (no-op) until a
   *  real newsletter endpoint exists — the form still works as a UI. */
  onSubscribe?: (email: string) => void;
}

/**
 * Standalone marketing-style footer, recreated from unibexs.com — distinct
 * from the plain "© Unibexs" footer already used across internal dashboard
 * layouts (components/footer/Footer.tsx). Meant to be dropped onto
 * public-facing pages (e.g. the partner public profile at /p/[slug]).
 */
export default function SiteFooter({ className = "", onSubscribe }: SiteFooterProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    onSubscribe?.(trimmed);
    setEmail("");
  };

  return (
    <footer className={`w-full bg-white ${className}`}>
      <div className="mx-auto max-w-6xl py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Newsletter */}
          <div className="lg:max-w-sm lg:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoImg.src} alt="Unibexs" className="h-16 w-auto" />

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Stay ahead with the latest industry insights, product updates, and trends. Delivered
              straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Join Unibexs Insider
              </button>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-12">
            {LINK_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-sm font-semibold text-slate-900">{col.heading}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 transition hover:text-slate-700"
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
        <div className="mt-14 border-t border-slate-100" />

        {/* Legal row, then social row below it */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 transition hover:text-slate-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-slate-700 transition hover:bg-indigo-100"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
