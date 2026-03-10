"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  MoreVertical,
  Settings, Trash2,
} from 'lucide-react';

import { usePaymentMethod } from "hooks/knowledge-hub/payment-methods/usePaymentMethodId";
import { useDeleteUniversity } from 'hooks/knowledge-hub/payment-methods/useDeletePaymentMethod';

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import UpdateUniversityType from "components/admin/KnowledgeHub/university/popups/UpdateUniversityType";
import DeletePaymentConfirmation from './DeletePaymentConfirmation';
import { useToast } from 'components/context/ToastContext';

interface PaymentMethodDetailsProps {
  id: string;
}

const PaymentMethodDetails = ({ id }: PaymentMethodDetailsProps) => {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [isUniversityTypeModalOpen, setIsUniversityTypeModalOpen] = useState(false);
  const [activeUniversity, setActiveUniversity] = useState<any>(null);

  const { deletePayment, isDeleting } =useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<
    string | null
  >(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] =
    useState<string>("");

  const { paymentMethod,error, loading } = usePaymentMethod(id);

  const handleBack = () => {
    router.push("/admin/universities/payment-methods");
  };

  const handleDelete = async () => {
    if (!selectedPaymentId) return;

    try {
      await deletePayment(selectedPaymentId);

      showToast(" Payment Method deleted successfully.");

      setIsDeleteOpen(false);
      setSelectedPaymentId(null);
      setSelectedPaymentMethodName("");

      setTimeout(() => router.push("/admin/universities/payment-methods"), 2000);

    } catch (error: any) {
      showToast("Failed to delete university. Please try again.");
    }
  };

  if (loading) {
    return <Loading text="Loading payment methods details..." />;
  }

  if (!paymentMethod) {
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
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === paymentMethod.id ? null : paymentMethod.id
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openDropdownId === paymentMethod.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Update Program Details"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm"
                        onClick={() => {
                          setActiveUniversity(paymentMethod);
                          setIsUniversityTypeModalOpen(true);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Settings className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Assign University Type
                        </span>
                      </button>

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                        onClick={() => {
                          setSelectedPaymentId(paymentMethod.id);
                          setSelectedPaymentMethodName(paymentMethod.name);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                          <Trash2 className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-red-900">
                          Delete Payment
                        </span>
                      </button>

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Back to Payments
                        </span>
                      </button>

                    </div>
                  </div>
                )}
              </div>
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

      <UpdateUniversityType
        isOpen={isUniversityTypeModalOpen}
        onClose={() => setIsUniversityTypeModalOpen(false)}
        universityId={activeUniversity?.id || null}
        initialData={activeUniversity}
      />

      <DeletePaymentConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        paymentMethodName={selectedPaymentMethodName}
      />

    </>
  );
};

export default PaymentMethodDetails;
