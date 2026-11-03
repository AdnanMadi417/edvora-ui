"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  ChevronRight,
  Pencil,
  Trash2,
  CreditCard,
} from "lucide-react";
import { MdOutlineCategory } from "react-icons/md";

import { useDeleteUniversity, useAllPaymentMethods } from "features/knowledge-hub/payment-methods/hooks";

import NextButton from "components/ub/core/NextButton";
import PrevButton from "components/ub/core/PrevButton";
import SearchInput from "components/ub/forms/SearchInput";

import NoMessagesFound from "components/ub/feedback/NoMessagesFound";

import DeletePaymentConfirmation from "features/universities/components/admin/payment-methods/popups/DeletePaymentConfirmation";
import CreatePayment from "features/universities/components/admin/payment-methods/popups/CreatePayment";

import Loading from "components/ub/feedback/Loading";

import { useRouter } from "next/navigation";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";

const PaymentMethodsTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { paymentMethods, loading, error, refetch } = useAllPaymentMethods();

  const { deletePayment, isDeleting } = useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string>("");

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredPaymentMethods = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return paymentMethods.filter((payment) => {
      const matchSearch = !term || payment.name?.toLowerCase().includes(term);
      const matchField = selectedField === "all" || (payment as any).field_id === selectedField;
      return matchSearch && matchField;
    });
  }, [paymentMethods, searchTerm, selectedState, selectedField]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "",
    direction: "asc",
  });

  const sortedPaymentMethods = React.useMemo(() => {
    if (!sortConfig.key) return filteredPaymentMethods;
    return [...filteredPaymentMethods].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (!aValue && !bValue) return 0;
      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue || "")
          : (bValue || "").localeCompare(aValue || "");
      }
      if (typeof aValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [filteredPaymentMethods, sortConfig]);

  const currentPaymentMethods = sortedPaymentMethods.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedField]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredPaymentMethods.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredPaymentMethods, currentPage]);

  const handleDelete = async () => {
    if (!selectedPaymentId) return;
    try {
      await deletePayment(selectedPaymentId);
      showToast("Payment Method deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedPaymentId(null);
      setSelectedPaymentMethodName("");
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to delete payment method. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Payment Methods</h3>
          <p className="mt-1 text-sm text-slate-500">Manage global payment methods assigned to universities</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={loading}
          icon={<CreditCard className="h-5 w-5" />}
          text="Create Payment"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 border-t border-slate-200 pt-6">
        <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{paymentMethods.length}</p>
            <p className="text-xs text-slate-500">Total Payment Methods</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by payment method name..."
        />
        <Button
          onClick={() => { setSearchTerm(""); setSelectedState("all"); setSelectedField("all"); setCurrentPage(1); }}
          icon={<RefreshCw className="h-4 w-4" />}
          text="Clear"
          bgColor="bg-white"
          textColor="text-red-600"
          borderColor="border-red-200"
          hoverTextColor="hover:text-red-600"
          hoverBorderColor="hover:border-red-200"
          className="hover:bg-red-50"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="group min-w-[250px] px-6 py-4 text-start font-bold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span>Payment Method</span>
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex min-w-[150px] items-center gap-2">
                  <MdOutlineCategory className="h-4 w-4 text-slate-500" />
                  <span>Description</span>
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Actions</span>
                </div>
              </th>

              <th className="w-8" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loading text="Fetching Payment Methods data..." />
                </td>
              </tr>
            )}

            {!error && !loading && currentPaymentMethods.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <NoMessagesFound
                    title="No Payment Methods found"
                    subtitle="There are currently no Payment Methods available."
                    icon={<CreditCard className="h-8 w-8 text-slate-400" />}
                  />
                </td>
              </tr>
            )}

            {!error && currentPaymentMethods.map((payment) => (
              <tr
                key={payment.id}
                className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                onClick={() => router.push(`/admin/config-universities/payment-methods/${payment.id}`)}
              >
                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-blue-700">
                      <CreditCard className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="w-full min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {payment.name}
                      </h3>
                    </div>
                  </div>
                </td>

                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <p className="truncate text-sm text-slate-600">
                    {payment.description ? payment.description.replace(/<[^>]*>/g, "") : "—"}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <a
                      role="menuitem"
                      aria-label="Edit Payment Method"
                      href={`/admin/config-universities/payment-methods/${payment.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                    >
                      <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                    </a>

                    <div className="h-6 border-l border-slate-200" />

                    <IconButton
                      aria-label="Delete Payment Method"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPaymentId(payment.id);
                        setSelectedPaymentMethodName(payment.name);
                        setIsDeleteOpen(true);
                      }}
                      icon={<Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />}
                      bgColor="bg-transparent"
                      textColor="text-slate-700"
                      borderColor="border-transparent"
                      hoverTextColor="hover:text-slate-700"
                      hoverBorderColor="hover:border-transparent"
                      className="hover:bg-slate-100 focus:outline-none"
                    />
                  </div>
                </td>

                <td className="w-8 pr-4 py-4">
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:justify-between">
        {paymentMethods.length > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
            Showing
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            to
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, paymentMethods.length)}</span>
            of
            <span className="font-medium">{paymentMethods.length}</span>
            Payment Methods
          </div>
        )}

        <div className="flex justify-end gap-2">
          <PrevButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            text="Prev"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          <span className="px-3 py-1 font-medium text-slate-500">
            Page {currentPage} of {Math.ceil(paymentMethods.length / itemsPerPage)}
          </span>
          <NextButton
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(paymentMethods.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(paymentMethods.length / itemsPerPage)}
            text="Next"
            icon={<ArrowRight className="h-4 w-4" />}
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

      <CreatePayment
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PaymentMethodsTable;
