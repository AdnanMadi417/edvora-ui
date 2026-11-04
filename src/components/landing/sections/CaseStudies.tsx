import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { caseStudies } from "lib/content";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Reveal from "../ui/Reveal";

export default function CaseStudies() {
  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading
          id="work-heading"
          eyebrow={caseStudies.eyebrow}
          heading={caseStudies.heading}
          action={
            <Link href={caseStudies.viewAll.href} className="inline-flex items-center gap-1 rounded-ub-md text-ub-label-md text-ub-text-link hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus">
              {caseStudies.viewAll.label}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          }
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {caseStudies.items.map((project, i) => (
            <Reveal as="li" key={project.client} delay={(i % 2) * 0.08} className={clsx(i % 2 === 1 && "md:translate-y-16")}>
              <Card notch interactive innerClassName="overflow-hidden">
                <article>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.cover}
                      alt={`${project.client}: ${project.title}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-ub-deliberate ease-ub-standard group-hover:scale-[1.03] motion-reduce:transform-none"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-ub-label-md text-ub-text-primary">{project.client}</span>
                      <Badge tone="blue">{project.industry}</Badge>
                    </div>
                    <h3 className="mt-3 text-ub-heading-md text-ub-text-primary">{project.title}</h3>
                    <p className="ub-tabular mt-4 inline-flex items-center gap-2 text-ub-heading-sm text-ub-success-500">
                      <TrendingUp className="h-5 w-5" aria-hidden />
                      {project.metric}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li key={tag}>
                          <Badge>{tag}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
