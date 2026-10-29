import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { footer, site } from "lib/content";
import Container from "./ui/Container";
import Logo from "./Logo";
import { socialIcons } from "./icons";

const linkClass =
  "rounded-ub-xs text-ub-body-sm text-ub-text-secondary transition-colors duration-ub-fast hover:text-ub-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus";

export default function Footer() {
  return (
    <footer className="border-t border-ub-border pb-10 pt-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-ub-body-sm text-ub-text-secondary">{site.tagline}</p>
            <address className="mt-6 space-y-2 not-italic">
              <a href={`mailto:${site.email}`} className={`${linkClass} flex items-center gap-2`}>
                <Mail className="h-4 w-4" aria-hidden /> {site.email}
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className={`${linkClass} flex items-center gap-2`}>
                <Phone className="h-4 w-4" aria-hidden /> {site.phone}
              </a>
              <p className="flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
                <MapPin className="h-4 w-4" aria-hidden /> {site.address}
              </p>
            </address>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-ub-label-md text-ub-text-primary">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-ub-border pt-8 sm:flex-row sm:items-center">
          <p className="text-ub-caption text-ub-text-secondary">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-2">
            {footer.socials.map(({ key, label, href }) => {
              const Icon = socialIcons[key];
              return (
                <li key={key}>
                  <a
                    href={href}
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-ub-full border border-ub-border text-ub-text-secondary transition-colors duration-ub-fast hover:border-ub-border-hover hover:text-ub-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
