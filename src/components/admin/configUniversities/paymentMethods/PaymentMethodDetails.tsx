"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
} from 'lucide-react';

import { usePaymentMethod } from "hooks/knowledge-hub/payment-methods/usePaymentMethodId";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";

interface PaymentMethodDetailsProps {
  id: string;
}

const PaymentMethodDetails = ({ id }: PaymentMethodDetailsProps) => {
  const router = useRouter();

  const { paymentMethod,error, loading } = usePaymentMethod(id);

  const handleBack = () => {
    router.push("/admin/config-universities/payment-methods");
  };

  if (loading) {
    return <Loading text="Loading payment methods details..." />;
  }

  if (!paymentMethod ) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border bg-card shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
                <CreditCard className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{paymentMethod.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Payments</span>
              </button>
            </div>

          </div>

          <div className="border-t border-gray-200 px-6 py-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h3>

            <p className="text-sm leading-relaxed text-slate-700">
              {paymentMethod.description || "No description provided."}
            </p>
          </div>

        </div>
      </div>

    </>
  );
};

export default PaymentMethodDetails;
