"use client";

import React, { useState } from "react";
import { Ban } from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import RefId from "components/ub/core/typography/RefId";
import AppDate from "components/ub/data/formatting/AppDate";
import DescriptionList from "components/ub/data/display/DescriptionList";
import KeyValueGrid from "components/ub/data/display/KeyValueGrid";
import SectionCard from "components/ub/data/cards/SectionCard";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import Button from "components/ub/core/buttons/Button";
import VoidPayIn from "./VoidPayIn";
import type { UniversityPayIn } from "../../types";

interface UniversityPayInSectionProps {
  payIn: UniversityPayIn | null;
  onRefetch?: () => void;
}

export default function UniversityPayInSection({ payIn, onRefetch }: UniversityPayInSectionProps) {
  const [showVoidModal, setShowVoidModal] = useState(false);

  if (!payIn) return null;

  const isVoided = !!payIn.voided_at;

  return (
    <>
      <SectionCard
        title="Institution pay-in"
        action={<StatusTag status={isVoided ? "Voided" : "Received"} tone={isVoided ? "danger" : "success"} size="md" />}
        footer={!isVoided ? <Button variant="secondary" size="sm" onClick={() => setShowVoidModal(true)} icon={<Ban className="h-4 w-4" aria-hidden="true" />} text="Void and correct" /> : undefined}
      >
        <div className="grid gap-4">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Amount received", value: <span className={isVoided ? "text-ub-text-tertiary line-through" : undefined}><Amount value={payIn.amount} currency={payIn.currency} /></span> },
              { label: "Paid on", value: <AppDate value={payIn.payment_date} /> },
            ]}
          />
          <DescriptionList
            layout="inline"
            divided
            fallback="Not available"
            items={[
              { label: "Payment reference", value: payIn.payment_reference && <RefId value={payIn.payment_reference} copyable /> },
              ...(isVoided ? [{ label: "Void reason", value: payIn.void_reason }] : []),
            ]}
          />
        </div>
      </SectionCard>

      <VoidPayIn
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        payIn={payIn}
        onSuccess={onRefetch}
      />
    </>
  );
}
