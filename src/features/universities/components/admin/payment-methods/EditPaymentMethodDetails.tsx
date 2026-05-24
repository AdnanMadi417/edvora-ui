"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import api from "lib/useApi";

import { useDeleteUniversity } from "hooks/knowledge-hub/payment-methods/useDeletePaymentMethod";
import { useUpdatePaymentMethods } from "hooks/knowledge-hub/payment-methods/useUpdatePaymentMethod";

import DeletePaymentConfirmation from "features/universities/components/admin/payment-methods/popups/DeletePaymentConfirmation";
import InputField from "components/form/InputField";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

interface EditPaymentMethodDetailsProps {
  id: string;
}

const EditPaymentMethodDetails = ({ id }: EditPaymentMethodDetailsProps) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { deletePayment, isDeleting } = useDeleteUniversity();
  const { updatePaymentMethods, loading } = useUpdatePaymentMethods();

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        setLoadingPayment(true);

        const token = Cookies.get("token");

        const res = await api.get(`/admin/payment-methods/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setPaymentMethod(res.data);

        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
        });

      } catch (err) {
        console.error(err);
        showToast("Failed to load payment method");
      } finally {
        setLoadingPayment(false);
      }
    };

    if (id) fetchPaymentMethod();
  }, [id]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isChanged =
    paymentMethod &&
    (formData.name !== paymentMethod.name ||
      formData.description !== (paymentMethod.description || ""));

  const handleUpdate = async () => {
    if (!paymentMethod) return;

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await updatePaymentMethods(paymentMethod.id, payload);

      showToast("Payment method updated successfully", "success");
      router.push("/admin/config-universities/payment-methods");

    }
    catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Failed to update payment method. ${backendMessage}`, "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedPaymentId) return;

    try {
      await deletePayment(selectedPaymentId);

      showToast("Payment method deleted successfully", "success");

      setIsDeleteOpen(false);
      router.push("/admin/config-universities/payment-methods");

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Deleted failed. ${backendMessage}`, "error");
    }

  };

  const handleBack = () => {
    router.push("/admin/config-universities/payment-methods");
  };

  if (loadingPayment) {
    return <div className="p-6">Loading payment method...</div>;
  }

  if (!paymentMethod) {
    return <div className="p-6">Payment method not found</div>;
  }

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="rounded-md border bg-card shadow-sm">

          <div className="flex justify-between border-b p-6">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-700">
                <CreditCard className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{formData.name}</h2>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdownId(openDropdownId === paymentMethod?.id ? null : paymentMethod?.id)
                }
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Actions
                <MoreVertical className="h-4 w-4" />
              </button>

              {openDropdownId === paymentMethod?.id && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                  <div className="space-y-2 p-2">

                    <button
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                      onClick={() => {
                        setSelectedPaymentId(paymentMethod?.id || null);
                        setSelectedPaymentMethodName(paymentMethod?.name || "");
                        setIsDeleteOpen(true);
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-red-900">Delete Payment</span>
                    </button>

                    <button
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                      onClick={handleBack}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                        <ChevronLeft className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">Back to Payments</span>
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="border-t px-6 py-6">

            <InputField
              label="Payment Method Name"
              field="name"
              required
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <InputField
              label="Description"
              field="description"
              placeholder="Brief description..."
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-5">

            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-5 w-5" />}
              text="Back"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
            />

            <Button
              icon={<Pencil className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Payment"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              onClick={handleUpdate}
              disabled={loading || !isChanged}
            />

          </div>

        </div>
      </div>

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

export default EditPaymentMethodDetails;
