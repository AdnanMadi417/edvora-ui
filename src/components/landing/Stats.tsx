"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { stats } from "lib/content";
import Container from "./ui/Container";

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, { duration: 1.4, ease: [0, 0, 0.2, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="ub-tabular">
      {display.toLocaleString("en")}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section aria-label="Key numbers" className="py-16 md:py-24">
      <Container>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-ub-2xl border border-ub-border bg-ub-navy-border lg:grid-cols-4">
          {stats.items.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-2 bg-ub-canvas p-6 md:p-8">
              <dt className="text-ub-body-sm text-ub-text-secondary">{s.label}</dt>
              <dd className="text-ub-data-lg text-ub-text-primary md:text-ub-data-xl">
                {/* Screen readers get the final number, not the animation. */}
                <span className="sr-only">
                  {s.value}
                  {s.suffix}
                </span>
                <span aria-hidden>
                  <CountUp value={s.value} suffix={s.suffix} />
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
