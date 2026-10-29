"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import clsx from "clsx";
import { testimonials } from "lib/content";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";

/** Scroll-snap carousel: swipe, arrow buttons, or arrow keys on the track. */
export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos < 8);
    setAtEnd(pos + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * rtl * ((card?.clientWidth ?? 320) + 16), behavior: reduce ? "auto" : "smooth" });
  };

  const navButton =
    "grid h-10 w-10 place-items-center rounded-ub-full border border-ub-border text-ub-text-primary transition-colors duration-ub-fast hover:border-ub-border-hover disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus";

  return (
    <section aria-labelledby="testimonials-heading" aria-roledescription="carousel" className="py-24 md:py-32">
      <Container>
        <SectionHeading
          id="testimonials-heading"
          eyebrow={testimonials.eyebrow}
          heading={testimonials.heading}
          action={
            <div className="flex gap-2">
              <button type="button" aria-label="Previous testimonial" onClick={() => scroll(-1)} disabled={atStart} className={navButton}>
                <ChevronLeft className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
              </button>
              <button type="button" aria-label="Next testimonial" onClick={() => scroll(1)} disabled={atEnd} className={navButton}>
                <ChevronRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
              </button>
            </div>
          }
        />
        <ul
          ref={trackRef}
          onScroll={update}
          tabIndex={0}
          aria-label="Testimonials"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") scroll(1);
            if (e.key === "ArrowLeft") scroll(-1);
          }}
          className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus md:mx-0 md:px-0"
        >
          {testimonials.items.map((t, i) => (
            <li
              key={t.name}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${testimonials.items.length}`}
              className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[calc((100%-32px)/3)]"
            >
              <figure className="flex h-full flex-col rounded-ub-2xl border border-ub-border bg-ub-surface p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5" role="img" aria-label={`Rated ${t.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} aria-hidden className={clsx("h-4 w-4", s < t.rating ? "fill-ub-tag-amber-solid text-ub-tag-amber-solid" : "text-ub-navy-border-strong")} />
                    ))}
                  </div>
                  <Image src={t.logo} alt={t.company} width={120} height={32} className="h-6 w-auto opacity-70 grayscale" loading="lazy" />
                </div>
                <blockquote className="mt-6 flex-1 text-ub-body-lg text-ub-text-primary">
                  <p>&ldquo;{t.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Image src={t.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-ub-full" loading="lazy" />
                  <div>
                    <p className="text-ub-label-md text-ub-text-primary">{t.name}</p>
                    <p className="text-ub-caption text-ub-text-secondary">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
