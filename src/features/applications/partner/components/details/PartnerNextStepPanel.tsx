"use client";

import { Download } from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import IconButton from "components/ub/core/buttons/IconButton";
import FileRow from "components/ub/data/display/FileRow";
import KeyValueGrid from "components/ub/data/display/KeyValueGrid";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";
import SectionCard from "components/ub/data/cards/SectionCard";
import Tag from "components/ub/data/badges/Tag";
import Alert from "components/ub/feedback/notifications/Alert";

export interface TemplateFile {
  key: string;
  name: string;
  hint: string;
  /** Download by file key; omit for files fetched another way (health declaration). */
  fileKey?: string | null;
  onDownload?: () => void;
}

export interface PartnerNextStepPanelProps {
  mode: "team-view" | "visa-payment" | "arrival-form" | "emgs" | null;
  /** Owner shown in team view. */
  ownerName?: string | null;
  visaFeeAmount?: number | null;
  visaFeeNote?: string | null;
  paymentMethods?: { id: string; name: string; currency?: string | null; instructions?: string | null }[];
  paymentMethodsLoading?: boolean;
  templates?: TemplateFile[];
  onDownloadFile?: (fileKey: string) => void;
  downloading?: boolean;
}

function TemplateRows({ templates, onDownloadFile, downloading }: Pick<PartnerNextStepPanelProps, "templates" | "onDownloadFile" | "downloading">) {
  if (!templates?.length) return null;
  return (
    <ul className="-my-4 divide-y divide-ub-border">
      {templates.map((t) => (
        <FileRow
          key={t.key}
          name={t.name}
          state="uploaded"
          stateLabel="To download"
          meta={t.hint}
          actions={
            <IconButton
              size="sm"
              variant="tertiary"
              title={`Download ${t.name}`}
              disabled={downloading}
              onClick={() => (t.onDownload ? t.onDownload() : t.fileKey && onDownloadFile?.(t.fileKey))}
              icon={<Download className={downloading ? "h-4 w-4 animate-pulse motion-reduce:animate-none" : "h-4 w-4"} aria-hidden="true" />}
            />
          }
        />
      ))}
    </ul>
  );
}

/**
 * What the Advisor needs for the current step, above the summary: visa
 * payment details, the arrival form template, EMGS guidance, or the team
 * view note. The action itself is the header's Primary button.
 */
export default function PartnerNextStepPanel({ mode, ownerName, visaFeeAmount, visaFeeNote, paymentMethods = [], paymentMethodsLoading, templates, onDownloadFile, downloading }: PartnerNextStepPanelProps) {
  if (!mode) return null;

  if (mode === "team-view") {
    return (
      <Alert tone="info" title={`Submitted by ${ownerName || "a team member"}`}>
        You can view this application; uploads and forms are done from their account.
      </Alert>
    );
  }

  if (mode === "emgs") {
    return (
      <SectionCard title="Upload the EMGS evaluation" description="Download the eval from the EMGS app, then upload it here.">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert tone="info" title="Download your eval" action={{ label: "View EMGS app instructions", href: "https://www.youtube.com/shorts/fT4Wmm4eWwI" }}>
            Your eval is ready. Download it directly from the EMGS app.
          </Alert>
          <Alert tone="warning" title="Check entry requirements" action={{ label: "Visit Education Malaysia", href: "https://educationmalaysia.gov.my/" }}>
            Check whether the student needs an eVISA or Visa on Arrival before travelling to Malaysia.
          </Alert>
        </div>
      </SectionCard>
    );
  }

  if (mode === "arrival-form") {
    return (
      <SectionCard title="Arrival form required" description="Download the template below, complete it, then upload the filled form.">
        <TemplateRows templates={templates} onDownloadFile={onDownloadFile} downloading={downloading} />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Pay the visa fee" description="Pay using one of the Institution's payment methods, then upload the receipt.">
      <div className="grid gap-4">
        {visaFeeAmount ? <KeyValueGrid columns={1} items={[{ label: "Amount due", value: <Amount value={visaFeeAmount} /> }]} /> : null}
        {visaFeeNote && <Alert tone="warning">{visaFeeNote}</Alert>}
        {paymentMethodsLoading ? (
          <p className="text-ub-body-sm text-ub-text-secondary" role="status">
            Loading payment methods…
          </p>
        ) : (
          paymentMethods.length > 0 && (
            <section aria-label="Payment methods">
              <h4 className="mb-3 text-ub-label-md text-ub-text-primary">Payment methods</h4>
              <ul className="grid gap-3 md:grid-cols-2">
                {paymentMethods.map((m) => (
                  <li key={m.id} className="rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ub-label-md text-ub-text-primary">{m.name}</span>
                      {m.currency && <Tag tone="brand" size="sm">{m.currency.toUpperCase()}</Tag>}
                    </div>
                    {m.instructions && <RichTextDisplay html={m.instructions} className="mt-2 text-ub-body-sm" />}
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
        {templates && templates.length > 0 && (
          <section aria-label="Documents for this payment">
            <h4 className="text-ub-label-md text-ub-text-primary">Documents for this payment</h4>
            <div className="mt-4">
              <TemplateRows templates={templates} onDownloadFile={onDownloadFile} downloading={downloading} />
            </div>
          </section>
        )}
      </div>
    </SectionCard>
  );
}
