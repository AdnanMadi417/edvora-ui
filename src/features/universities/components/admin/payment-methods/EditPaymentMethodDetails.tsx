"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import api from "lib/useApi";

import { useDeleteUniversity, useUpdatePaymentMethods } from "features/knowledge-hub/payment-methods/hooks";

import DeletePaymentConfirmation from "features/universities/components/admin/payment-methods/popups/DeletePaymentConfirmation";
import InputField from "components/form/fields/InputField";
import RichTextEditor from "components/form/fields/RichTextEditor";
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        showToast("Failed to load payment method.", "error");
      } finally {
        setLoadingPayment(false);
      }
    };

    if (id) fetchPaymentMethod();
  }, [id]);

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    const text = value.replace(/<[^>]*>/g, "").trim();
    if (!text) return "";
    if (text.length < 10) return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid = !validateName(formData.name) && !validateDescription(formData.description);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isChanged =
    paymentMethod &&
    (formData.name !== paymentMethod.name ||
      formData.description !== (paymentMethod.description || ""));

  const handleUpdate = async () => {
    if (!paymentMethod) return;

    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const descErr = validateDescription(formData.description);
    if (descErr) newErrors.description = descErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await updatePaymentMethods(paymentMethod.id, payload);

      showToast("Payment method updated successfully", "success");
      router.push(`/admin/config-universities/payment-methods/${id}`);

    } catch (error: any) {
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
    router.push(`/admin/config-universities/payment-methods/${id}`);
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
        <div className="rounded-md border bg-white shadow-sm">

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
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Actions
                <MoreVertical className="h-4 w-4" />
              </button>

              {openDropdownId === paymentMethod?.id && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white ring-1 ring-black/5">
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
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => {
                const err = validateName(formData.name);
                if (err) setErrors((prev) => ({ ...prev, name: err }));
              }}
            />

            <RichTextEditor
              label="Description"
              field="description"
              placeholder="Brief description..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

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
              icon={<Pencil className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Payment"}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              onClick={handleUpdate}
              disabled={loading || !isChanged || !isFormValid}
              className="flex-1 hover:bg-blue-700"
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
