"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { processSteps } from "lib/content";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

export default function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 85%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="process" aria-labelledby="process-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading id="process-heading" eyebrow={processSteps.eyebrow} heading={processSteps.heading} subheading={processSteps.subheading} />
        <div className="relative mt-16">
          {/* Track + animated progress: horizontal on desktop, vertical on mobile */}
          <div aria-hidden className="absolute bottom-0 start-[11px] top-0 w-0.5 bg-ub-navy-border lg:bottom-auto lg:end-0 lg:start-0 lg:top-[11px] lg:h-0.5 lg:w-auto">
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-ub-blue-400 lg:hidden" />
            <motion.div style={{ scaleX: progress }} className="hidden h-full w-full origin-left bg-ub-blue-400 rtl:origin-right lg:block" />
          </div>
          <ol ref={listRef} className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {processSteps.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08} className="relative ps-10 lg:ps-0 lg:pt-12">
                <span
                  aria-hidden
                  className="absolute start-0 top-0 grid h-6 w-6 place-items-center rounded-ub-full border-2 border-ub-blue-400 bg-ub-canvas text-ub-label-sm text-ub-text-primary"
                >
                  {i + 1}
                </span>
                <p className="ub-tabular text-ub-label-sm text-ub-text-secondary">
                  Step {String(i + 1).padStart(2, "0")} · {step.duration}
                </p>
                <h3 className="mt-2 text-ub-heading-md text-ub-text-primary">{step.title}</h3>
                <p className="mt-2 text-ub-body-sm text-ub-text-secondary">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
