import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import RefId from "components/ub/core/typography/RefId";
import AppDate from "components/ub/data/formatting/AppDate";
import DescriptionList from "components/ub/data/display/DescriptionList";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";

export interface StudentInfoCardProps {
  email?: string | null;
  phone?: string | null;
  nationality?: string | null;
  /** Shown with the ss02 set so I/l/1 and O/0 read apart. */
  passportNumber?: string | null;
  birthday?: string | null;
  gender?: string | null;
  address?: string | null;
  /** WhatsApp link for the contact action (e.g. https://wa.me/601172591101). Hidden when absent. */
  whatsappUrl?: string | null;
  /** Label for the WhatsApp action. Default "Message on WhatsApp". */
  whatsappLabel?: string;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Contact card (brief §6): contact details, nationality, passport number and a WhatsApp action. */
export default function StudentInfoCard({ email, phone, nationality, passportNumber, birthday, gender, address, whatsappUrl, whatsappLabel = "Message on WhatsApp", state = "ready", onRetry, className }: StudentInfoCardProps) {
  return (
    <SectionCard title="Student" state={state} loadingRows={5} errorMessage="Student details couldn't load." onRetry={onRetry} className={className}>
      <DescriptionList
        layout="inline"
        divided
        fallback="Not available"
        items={[
          { label: "Email", value: email && <a href={`mailto:${email}`} className="break-all text-ub-text-link hover:underline">{email}</a> },
          { label: "Phone", value: phone && <span className="ub-tabular" dir="ltr">{phone}</span> },
          { label: "Nationality", value: nationality },
          { label: "Passport no.", value: passportNumber && <RefId value={passportNumber} /> },
          { label: "Date of birth", value: birthday && <AppDate value={birthday} className="ub-tabular" /> },
          { label: "Gender", value: gender },
          { label: "Address", value: address },
        ]}
      />
      {whatsappUrl && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={clsx(buttonBase, buttonSizes.md, buttonVariants.secondary, "mt-4 w-full")}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {whatsappLabel}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </SectionCard>
  );
}
