import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, GraduationCap, LayoutGrid, ShieldCheck, Users } from "lucide-react";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import { buttonBase, buttonSizes, buttonVariants, card, cardInteractive, focusRing } from "components/ub/recipes";

export const metadata: Metadata = {
  title: "Explore the Unibexs demo",
  description: "Explore Unibexs role previews, application workflows, and the shared design system.",
  robots: { index: false, follow: false },
};

const areas = [
  { name: "Advisor", icon: GraduationCap, href: "/partner/home", description: "Explore your workspace, manage student applications, and track commissions.", detail: "Applications · Universities · Team" },
  { name: "Admin", icon: ShieldCheck, href: "/admin/applications", description: "Oversee applications and manage the people and programs behind every placement.", detail: "Applications · Advisors · Programs" },
  { name: "Account manager", icon: Briefcase, href: "/account-manager/applications", description: "Support advisors, follow application progress, and coordinate the next steps.", detail: "Applications · Advisors · Commission" },
  { name: "Reviewer", icon: Users, href: "/reviewer/advisors", description: "Review advisor profiles and explore the account manager directory.", detail: "Advisors · Account managers" },
  { name: "Data entry", icon: BookOpen, href: "/data-entry/knowledge-hub", description: "Explore the knowledge hub and maintain resources for the team.", detail: "Knowledge hub · Resources" },
];

const showcases = [
  { name: "Design system", href: "/design-system", description: "Brand foundations, components, and interaction patterns." },
  { name: "Advisor profile", href: "/design-system/patterns/advisor-profile", description: "Explore the profile editor and public profile pattern." },
  { name: "Application details", href: "/design-system/patterns/application-details", description: "See how the shared components form an application workspace." },
  { name: "Component gallery", href: "/ui-unibexs-template-2026", description: "Browse the portal’s reusable interface components." },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-ub-canvas text-ub-text-primary">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ub-border pb-6">
          <Link href="/" className={`text-xl font-semibold tracking-tight ${focusRing}`} aria-label="Unibexs home">unibexs<span className="text-ub-text-link">.</span></Link>
          <ThemeSwitcher className="w-64" />
        </header>

        <section className="grid gap-8 py-12 md:grid-cols-[1.5fr_1fr] md:items-end md:py-20" aria-labelledby="demo-heading">
          <div>
            <p className="mb-4 text-ub-label-md text-ub-text-link">THE UNIBEXS DEMO</p>
            <h1 id="demo-heading" className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">A closer look at every step forward.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ub-text-secondary">From the first application to the next opportunity. Explore the workspaces that bring students, advisors, and teams together.</p>
            <Link href="/partner/home" className={`${buttonBase} ${buttonSizes.lg} ${buttonVariants.primary} mt-8`}>Explore the advisor demo <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
          <aside className={`${card} p-6`} aria-label="About this demo">
            <LayoutGrid aria-hidden className="mb-4 h-7 w-7 text-ub-text-link" />
            <h2 className="text-ub-heading-sm">One platform. Five perspectives.</h2>
            <p className="mt-3 text-ub-body-md text-ub-text-secondary">Each workspace opens with a sample user. No sign-in is required.</p>
            <p className="mt-4 border-t border-ub-border pt-4 text-ub-body-sm text-ub-text-tertiary">By default, this preview uses mock data. Demo uploads are discarded.</p>
          </aside>
        </section>

        <section aria-labelledby="workspaces-heading">
          <h2 id="workspaces-heading" className="text-2xl font-semibold tracking-tight">Choose your perspective</h2>
          <p className="mt-2 text-ub-body-md text-ub-text-secondary">Step into a workspace and try its workflows.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areas.map(({ name, icon: Icon, href, description, detail }) => (
              <Link key={name} href={href} className={`${card} ${cardInteractive} ${focusRing} group flex flex-col p-6`}>
                <div className="mb-6 flex items-center justify-between"><Icon aria-hidden className="h-6 w-6 text-ub-text-link" /><ArrowRight aria-hidden className="h-5 w-5 text-ub-text-tertiary transition-transform group-hover:translate-x-1" /></div>
                <h3 className="text-xl font-semibold">{name}</h3>
                <p className="mb-6 mt-3 text-ub-body-md text-ub-text-secondary">{description}</p>
                <p className="mt-auto border-t border-ub-border pt-4 text-ub-body-sm text-ub-text-tertiary">{detail}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-16" aria-labelledby="showcases-heading">
          <h2 id="showcases-heading" className="text-2xl font-semibold tracking-tight">Behind the experience</h2>
          <p className="mt-2 text-ub-body-md text-ub-text-secondary">Explore the patterns and building blocks of Unibexs.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {showcases.map(({ name, href, description }) => (
              <Link key={name} href={href} className={`${card} ${cardInteractive} ${focusRing} flex items-center justify-between gap-5 p-5`}>
                <div><h3 className="text-ub-heading-sm">{name}</h3><p className="mt-2 text-ub-body-sm text-ub-text-secondary">{description}</p></div>
                <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-ub-text-link" />
              </Link>
            ))}
          </div>
        </section>
        <footer className="border-t border-ub-border py-6 text-ub-body-sm text-ub-text-tertiary">Unibexs · Interactive UI preview</footer>
      </div>
    </main>
  );
}
