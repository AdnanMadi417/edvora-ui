import type { Metadata } from "next";
import { faq, services, site } from "lib/content";
import LandingMotion from "components/landing/ui/LandingMotion";
import Navbar from "components/landing/Navbar";
import Hero from "components/landing/Hero";
import ClientLogos from "components/landing/ClientLogos";
import Services from "components/landing/Services";
import CaseStudies from "components/landing/CaseStudies";
import Process from "components/landing/Process";
import TechStack from "components/landing/TechStack";
import WhyUsBento from "components/landing/WhyUsBento";
import Stats from "components/landing/Stats";
import Testimonials from "components/landing/Testimonials";
import EngagementModels from "components/landing/EngagementModels";
import FAQ from "components/landing/FAQ";
import ContactCTA from "components/landing/ContactCTA";
import Footer from "components/landing/Footer";

const title = `${site.name} | ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  alternates: { canonical: site.path },
  openGraph: {
    type: "website",
    url: site.path,
    siteName: site.name,
    title,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.tagline }],
  },
  twitter: { card: "summary_large_image", title, description: site.description, images: [site.ogImage] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: `${site.url}${site.path}`,
      email: site.email,
      telephone: site.phone,
      slogan: site.tagline,
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#service`,
      name: site.name,
      description: site.description,
      url: `${site.url}${site.path}`,
      email: site.email,
      telephone: site.phone,
      address: { "@type": "PostalAddress", streetAddress: site.address },
      areaServed: "Worldwide",
      provider: { "@id": `${site.url}/#organization` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: services.items.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.description } })),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function LandingPage() {
  return (
    // A dark (Night Blue) section in the Unibexs design system: tokens switch via data-ub-theme.
    <div data-ub-theme="dark" className="min-h-screen overflow-x-clip bg-ub-canvas font-sans text-ub-text-primary antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a
        href="#main"
        className="sr-only z-[70] rounded-ub-full bg-ub-action-primary px-4 py-2 text-ub-label-md text-ub-action-primary-text focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        Skip to content
      </a>
      <LandingMotion>
        <Navbar />
        <main id="main">
          <Hero />
          <ClientLogos />
          <Services />
          <CaseStudies />
          <Process />
          <TechStack />
          <WhyUsBento />
          <Stats />
          <Testimonials />
          <EngagementModels />
          <FAQ />
          <ContactCTA />
        </main>
        <Footer />
      </LandingMotion>
    </div>
  );
}
