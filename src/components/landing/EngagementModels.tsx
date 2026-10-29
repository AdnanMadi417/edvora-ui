import { Check } from "lucide-react";
import clsx from "clsx";
import { engagementModels } from "lib/content";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Reveal from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";

export default function EngagementModels() {
  return (
    <section aria-labelledby="models-heading" className="py-24 md:py-32">
      <Container>
        <SectionHeading id="models-heading" eyebrow={engagementModels.eyebrow} heading={engagementModels.heading} />
        <ul className="mt-12 grid gap-4 lg:grid-cols-3 lg:items-stretch">
          {engagementModels.items.map((model, i) => (
            <Reveal as="li" key={model.name} delay={i * 0.08} className={clsx(model.highlighted && "lg:-my-4")}>
              <Card notch={model.highlighted} highlighted={model.highlighted} innerClassName={clsx("flex flex-col p-6 md:p-8", model.highlighted && "bg-ub-navy-surface-2")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-ub-heading-md text-ub-text-primary">{model.name}</h3>
                  {model.highlighted && <Badge tone="blue">Most popular</Badge>}
                </div>
                <p className="mt-2 text-ub-body-sm text-ub-text-secondary">{model.for}</p>
                {model.price && <p className="ub-tabular mt-6 text-ub-heading-lg text-ub-text-primary">{model.price}</p>}
                <ul className="mt-6 flex-1 space-y-3">
                  {model.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-ub-body-sm text-ub-text-primary">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon-interactive" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                {/* One primary action per view: only the highlighted plan gets it. */}
                <ButtonLink href={model.cta.href} variant={model.highlighted ? "primary" : "ghost"} className="mt-8 w-full">
                  {model.cta.label}
                </ButtonLink>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
