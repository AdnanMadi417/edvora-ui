import Image from "next/image";
import { ShieldCheck, Check, CalendarCheck } from "lucide-react";
import clsx from "clsx";
import { whyUs } from "lib/content";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Card from "../ui/Card";
import Reveal from "../ui/Reveal";

function Tile({ title, description, className, children, delay = 0 }: { title: string; description: string; className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <Reveal as="li" delay={delay} className={className}>
      <Card innerClassName="flex flex-col gap-6 p-6">
        <div className="flex-1">{children}</div>
        <div>
          <h3 className="text-ub-heading-md text-ub-text-primary">{title}</h3>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">{description}</p>
        </div>
      </Card>
    </Reveal>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${30 - ((p - min) / (max - min || 1)) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-12 w-full" aria-hidden>
      <polyline points={d} fill="none" stroke="var(--ub-blue-300)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function WhyUsBento() {
  const { team, demos, pricing, uptime, security, support } = whyUs;
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading id="about-heading" eyebrow={whyUs.eyebrow} heading={whyUs.heading} />
        <ul className="mt-12 grid gap-4 md:grid-cols-6 lg:grid-cols-12">
          <Tile title={team.title} description={team.description} className="md:col-span-3 lg:col-span-3">
            <div className="flex items-center">
              {team.avatars.map((src, i) => (
                <Image key={src} src={src} alt="" width={48} height={48} className={clsx("h-12 w-12 rounded-ub-full border-2 border-ub-navy-surface-1", i > 0 && "-ms-2")} />
              ))}
              <span className="ub-tabular -ms-2 grid h-12 w-12 place-items-center rounded-ub-full border-2 border-ub-navy-surface-1 bg-ub-blue-50 text-ub-label-md text-ub-blue-700">{team.extra}</span>
            </div>
          </Tile>

          <Tile title={demos.title} description={demos.description} className="md:col-span-3 lg:col-span-5" delay={0.05}>
            <div className="grid grid-cols-5 gap-2">
              {demos.days.map((day, i) => (
                <div key={day} className={clsx("rounded-ub-md border p-2", i === 4 ? "border-ub-blue-400 bg-ub-navy-surface-3" : "border-ub-border")}>
                  <p className="text-ub-caption text-ub-text-secondary">{day}</p>
                  {i === 4 ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-ub-label-sm text-ub-text-primary">
                      <CalendarCheck className="h-4 w-4 text-ub-icon-interactive" aria-hidden /> Demo
                    </p>
                  ) : (
                    <div className="mt-3 h-1.5 rounded-ub-full bg-ub-navy-border" />
                  )}
                </div>
              ))}
            </div>
          </Tile>

          <Tile title={uptime.title} description={uptime.description} className="md:col-span-3 lg:col-span-4" delay={0.1}>
            <p className="ub-tabular text-ub-data-xl text-ub-text-primary">{uptime.value}</p>
            <Sparkline points={uptime.sparkline} />
          </Tile>

          <Tile title={pricing.title} description={pricing.description} className="md:col-span-3 lg:col-span-4" delay={0.15}>
            <dl className="rounded-ub-lg border border-ub-border bg-ub-navy-surface-2 p-4 text-ub-body-sm">
              {pricing.lines.map(([label, amount]) => (
                <div key={label} className="flex justify-between py-1.5">
                  <dt className="text-ub-text-secondary">{label}</dt>
                  <dd className="ub-tabular text-ub-text-primary">{amount}</dd>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-ub-border pt-3 text-ub-label-md">
                <dt className="text-ub-text-primary">Total</dt>
                <dd className="ub-tabular text-ub-text-primary">{pricing.total}</dd>
              </div>
            </dl>
          </Tile>

          <Tile title={security.title} description={security.description} className="md:col-span-3 lg:col-span-4" delay={0.2}>
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-10 w-10 shrink-0 text-ub-success-500" aria-hidden />
              <ul className="space-y-2">
                {security.checks.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-ub-body-sm text-ub-text-primary">
                    <Check className="h-4 w-4 text-ub-success-500" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Tile>

          <Tile title={support.title} description={support.description} className="md:col-span-3 lg:col-span-4" delay={0.25}>
            <div className="space-y-2">
              {support.messages.map(([from, text], i) => (
                <p
                  key={i}
                  className={clsx(
                    "w-fit max-w-[85%] rounded-ub-xl px-4 py-2 text-ub-body-sm",
                    from === "client" ? "bg-ub-navy-surface-3 text-ub-text-primary" : "ms-auto bg-ub-action-primary text-ub-action-primary-text",
                  )}
                >
                  <span className="sr-only">{from === "client" ? "Client: " : "Team: "}</span>
                  {text}
                </p>
              ))}
            </div>
          </Tile>
        </ul>
      </Container>
    </section>
  );
}
