import { ArrowRight } from "lucide-react";
import { hero } from "lib/content";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import Reveal from "./ui/Reveal";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pb-16 pt-16 md:pb-24 md:pt-24">
      <Container>
        <div className="max-w-[880px]">
          <Reveal>
            <p className="inline-flex h-7 items-center gap-2 rounded-ub-full border border-ub-border px-3 text-ub-label-sm text-ub-text-secondary">
              <span aria-hidden className="h-2 w-2 rounded-ub-full bg-ub-success-500" />
              {hero.badge}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 id="hero-heading" className="mt-6 text-ub-display-lg-mobile text-ub-text-primary sm:text-ub-display-lg">
              <span className="block">{hero.headline[0]}</span>
              <span className="block text-ub-blue-200">{hero.headline[1]}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-ub-reading text-ub-body-lg text-ub-text-secondary">{hero.subheadline}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={hero.primaryCta.href} variant="inverse" size="lg" icon={<ArrowRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden />}>
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="ghost" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          </Reveal>
        </div>
        <HeroVisual />
      </Container>
    </section>
  );
}
