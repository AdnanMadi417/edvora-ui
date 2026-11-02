import AppDate from "components/ub/data/AppDate";
import DescriptionList from "components/ub/data/DescriptionList";
import SectionCard, { type SectionCardState } from "components/ub/data/SectionCard";

export interface StudentBackgroundCardProps {
  education: { id: string; institution: string; qualification: string; grade: string | null; endDate: string | null }[];
  englishTests: { id: string; test: string; score: string; date: string | null }[];
  emergencyContacts: { id: string; name: string; relation: string | null; phone: string | null }[];
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Previous education, English tests and emergency contacts, as label/value rows. */
export default function StudentBackgroundCard({ education, englishTests, emergencyContacts, state = "ready", onRetry, className }: StudentBackgroundCardProps) {
  const empty = education.length + englishTests.length + emergencyContacts.length === 0;
  return (
    <SectionCard
      title="Background"
      state={state === "ready" && empty ? "empty" : state}
      empty={{ title: "No background details yet" }}
      errorMessage="Background details couldn't load."
      onRetry={onRetry}
      className={className}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <section aria-label="Education">
          <h4 className="mb-3 text-ub-label-md text-ub-text-primary">Education</h4>
          <DescriptionList
            fallback="Not available"
            items={education.map((e) => ({
              label: e.institution,
              value: (
                <>
                  {e.qualification}
                  {e.grade && <span className="ub-tabular block text-ub-body-sm text-ub-text-secondary">{e.grade}{e.endDate && <> · <AppDate value={e.endDate} /></>}</span>}
                </>
              ),
            }))}
          />
        </section>
        <section aria-label="English tests">
          <h4 className="mb-3 text-ub-label-md text-ub-text-primary">English tests</h4>
          <DescriptionList
            fallback="Not available"
            items={englishTests.map((t) => ({
              label: t.test,
              value: (
                <span className="ub-tabular">
                  {t.score}
                  {t.date && <span className="block text-ub-body-sm text-ub-text-secondary"><AppDate value={t.date} /></span>}
                </span>
              ),
            }))}
          />
        </section>
        <section aria-label="Emergency contacts">
          <h4 className="mb-3 text-ub-label-md text-ub-text-primary">Emergency contacts</h4>
          <DescriptionList
            fallback="Not available"
            items={emergencyContacts.map((c) => ({
              label: c.relation ? `${c.name} (${c.relation})` : c.name,
              value: c.phone && <span className="ub-tabular" dir="ltr">{c.phone}</span>,
            }))}
          />
        </section>
      </div>
    </SectionCard>
  );
}
