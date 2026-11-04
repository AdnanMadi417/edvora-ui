import Amount from "components/ub/core/typography/Amount";
import AppDate from "components/ub/data/formatting/AppDate";
import DescriptionList from "components/ub/data/display/DescriptionList";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";

export interface ApplicationSummaryCardProps {
  programme?: string | null;
  institution?: string | null;
  qualificationLevel?: string | null;
  /** ISO date. */
  intake?: string | null;
  durationMonths?: number | null;
  tuition?: { amount: number; currency: string } | null;
  /** ISO date the application was submitted. */
  submittedAt?: string | null;
  /** The Advisor who owns the application. */
  advisorName?: string | null;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Programme, Institution, intake, tuition (tabular RM), submitted date and Advisor. */
export default function ApplicationSummaryCard({ programme, institution, qualificationLevel, intake, durationMonths, tuition, submittedAt, advisorName, state = "ready", onRetry, className }: ApplicationSummaryCardProps) {
  return (
    <SectionCard title="Application summary" state={state} loadingRows={5} errorMessage="The summary couldn't load." onRetry={onRetry} className={className}>
      <DescriptionList
        columns={2}
        fallback="Not available"
        items={[
          { label: "Programme", value: programme, fullWidth: true },
          { label: "Institution", value: institution },
          { label: "Level", value: qualificationLevel },
          { label: "Intake", value: intake && <AppDate value={intake} className="ub-tabular" /> },
          { label: "Duration", value: durationMonths ? <span dir="auto" className="ub-tabular">{durationMonths} months</span> : null },
          { label: "Tuition", value: tuition && <Amount value={tuition.amount} currency={tuition.currency} /> },
          { label: "Submitted", value: submittedAt && <AppDate value={submittedAt} className="ub-tabular" /> },
          { label: "Advisor", value: advisorName },
        ]}
      />
    </SectionCard>
  );
}
