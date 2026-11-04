import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "lib/content";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Card from "../ui/Card";
import Reveal from "../ui/Reveal";
import { serviceIcons } from "../icons";

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading id="services-heading" eyebrow={services.eyebrow} heading={services.heading} subheading={services.subheading} />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service, i) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Reveal as="li" key={service.title} delay={i * 0.05}>
                <Card notch interactive innerClassName="flex flex-col p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-ub-lg bg-ub-navy-surface-3 text-ub-icon-interactive transition-transform duration-ub-base ease-ub-standard group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none">
                    {Icon && <Icon className="h-6 w-6" aria-hidden />}
                  </span>
                  <h3 className="mt-6 text-ub-heading-md text-ub-text-primary">{service.title}</h3>
                  <p className="mt-2 flex-1 text-ub-body-md text-ub-text-secondary">{service.description}</p>
                  <Link
                    href={service.href}
                    className="mt-6 inline-flex items-center gap-1 self-start rounded-ub-md text-ub-label-md text-ub-text-link after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
                  >
                    Learn more<span className="sr-only"> about {service.title.toLowerCase()}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-ub-fast group-hover:translate-x-1 rtl:-scale-x-100" aria-hidden />
                  </Link>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
