import { faq } from "lib/content";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Accordion from "../ui/Accordion";

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading id="faq-heading" eyebrow={faq.eyebrow} heading={faq.heading} className="self-start lg:sticky lg:top-24" />
        <Accordion items={faq.items} />
      </Container>
    </section>
  );
}
