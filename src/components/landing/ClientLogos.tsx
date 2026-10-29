import Image from "next/image";
import { clientLogos } from "lib/content";
import Container from "./ui/Container";
import Marquee from "./ui/Marquee";

export default function ClientLogos() {
  return (
    <section aria-labelledby="clients-heading" className="py-12 md:py-16">
      <Container>
        <h2 id="clients-heading" className="text-center text-ub-label-md text-ub-text-secondary">
          {clientLogos.heading}
        </h2>
        <Marquee className="mt-8" durationSeconds={36}>
          <ul className="flex items-center">
            {clientLogos.logos.map((logo) => (
              <li key={logo.name} className="px-8 md:px-12">
                <Image src={logo.src} alt={logo.name} width={160} height={40} className="h-8 w-auto opacity-70 grayscale transition-opacity duration-ub-fast hover:opacity-100" loading="lazy" />
              </li>
            ))}
          </ul>
        </Marquee>
      </Container>
    </section>
  );
}
