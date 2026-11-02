"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Pencil } from "lucide-react";

import { usePaymentMethod } from "features/knowledge-hub/payment-methods/hooks";

import Loading from "components/ub/feedback/Loading";
import EmptyData from "components/ub/feedback/EmptyTableData";
import RichTextDisplay from "components/ub/data/RichTextDisplay";
import Button from "components/ub/core/Button";

interface PaymentMethodDetailsProps {
  id: string;
}

const PaymentMethodDetails = ({ id }: PaymentMethodDetailsProps) => {
  const router = useRouter();

  const { paymentMethod, error, loading } = usePaymentMethod(id);

  const handleBack = () => {
    router.push("/admin/config-universities/payment-methods");
  };

  if (loading) {
    return <Loading text="Loading payment method details..." />;
  }

  if (!paymentMethod) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6 max-w-ub-dashboard mx-auto">
        <div className="rounded-md border bg-white shadow-sm">

          <div className="flex items-center gap-4 border-b p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{paymentMethod.name}</h2>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h3>
            {paymentMethod.description
              ? <RichTextDisplay html={paymentMethod.description} />
              : <p className="text-sm text-slate-400">No description provided.</p>
            }
          </div>

          <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-5 w-5" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
              className="flex-1 hover:bg-slate-50"
            />
            <Button
              onClick={() => router.push(`/admin/config-universities/payment-methods/${id}/edit`)}
              icon={<Pencil className="h-5 w-5" />}
              text="Edit Payment Method"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="flex-1 hover:bg-blue-700"
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default PaymentMethodDetails;
