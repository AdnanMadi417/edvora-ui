"use client";

import React, { useState } from "react";
import { Banknote, Calendar, Ban } from "lucide-react";
import DetailStatusBadge from "components/ub/data/DetailStatusBadge";
import AppDate from "components/ub/data/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import Button from "components/ub/core/Button";
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
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Banknote className="h-4 w-4 text-slate-400" />
            University Pay-In
          </p>
          <p className={`mt-1 text-lg font-bold ${isVoided ? "text-slate-400 line-through" : "text-slate-900"}`}>
            {formatCommissionAmount(payIn.amount, payIn.currency)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{payIn.payment_reference}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            Paid on <AppDate value={payIn.payment_date} format="short" />
          </p>
          {isVoided && payIn.void_reason && (
            <p className="mt-2 text-xs text-red-600">Void reason: {payIn.void_reason}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <DetailStatusBadge variant={isVoided ? "danger" : "success"}>
            {isVoided ? "Voided" : "Active"}
          </DetailStatusBadge>
          {!isVoided && (
            <Button
              onClick={() => setShowVoidModal(true)}
              icon={<Ban className="h-4 w-4" />}
              text="Void & Correct"
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-300"
              className="hover:bg-red-50"
            />
          )}
        </div>
      </div>

      <VoidPayIn
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        payIn={payIn}
        onSuccess={onRefetch}
      />
    </>
  );
}
