"use client";

import Link from "next/link";
import Logo from "components/ub/brand/Logo";
import SiteFooter from "components/ub/navigation/layout/SiteFooter";
import StickyActionBar from "components/ub/navigation/controls/StickyActionBar";
import FadeIn from "components/ub/core/motion/FadeIn";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import type { PublicPartnerProfile } from "features/partners/types";
import AdvisorProfile, { channelIcon } from "features/partners/components/profile/AdvisorProfile";
import { DEFAULT_CONTACT_LABEL, contactHref, draftFromProfile } from "features/partners/components/profile/profileModel";

// Shown when the Advisor hasn't written their own questions yet. Written for
// the prospective student reading this page.
const VISITOR_FAQ = [
  {
    question: "What does the “Verified advisor” badge mean?",
    answer: "Unibexs has confirmed this advisor has supported at least one student through visa approval. It's granted by Unibexs, never self-reported.",
  },
  {
    question: "How do I get in touch?",
    answer: "Use the contact button on this page. It opens a chat or page with this advisor directly.",
  },
  {
    question: "Is this page official?",
    answer: "Yes. Unibexs hosts this page for the advisor and shows only the details they've chosen to publish.",
  },
];

interface Props {
  profile: PublicPartnerProfile;
  spacious?: boolean;
  embedded?: boolean;
}

/** /p/[slug]: the Advisor's public page, read-only, with a contact bar on phones. */
export default function PartnerPublicProfile({ profile, spacious = false, embedded = false }: Props) {
  const draft = draftFromProfile(profile);
  if (draft.faqs.length === 0) draft.faqs = VISITOR_FAQ;
  const href = contactHref(draft.contact_channel, draft.contact_value, draft.display_name);
  const ContactIcon = channelIcon(draft.contact_channel);

  return (
    <div className="ub-canvas-light min-h-screen">
      {!embedded && <header className="border-b border-ub-border bg-ub-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link href="/" aria-label="Unibexs home">
            <Logo size="sm" />
          </Link>
        </div>
      </header>}

      <main className={`mx-auto px-4 pb-28 pt-6 md:pb-12 ${spacious ? "max-w-6xl" : "max-w-3xl"}`}>
        <FadeIn>
          <AdvisorProfile spacious={spacious} profile={profile} draft={draft} />
        </FadeIn>
      </main>

      {!embedded && <SiteFooter />}

      {href && (
        <StickyActionBar aboveBottomNav={false} aria-label="Contact the advisor">
          <a href={href} target="_blank" rel="noopener noreferrer" className={`${buttonBase} ${buttonVariants.primary} ${buttonSizes.md} flex-1`}>
            <ContactIcon className="h-5 w-5" aria-hidden="true" />
            {draft.contact_label.trim() || DEFAULT_CONTACT_LABEL}
          </a>
        </StickyActionBar>
      )}
    </div>
  );
}
