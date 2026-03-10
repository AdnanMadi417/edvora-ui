"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  Eye,
  Pencil,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { MdOutlineCategory } from 'react-icons/md';

import { useDeleteUniversity } from "hooks/knowledge-hub/payment-methods/useDeletePaymentMethod";
import { useAllPaymentMethods } from "hooks/knowledge-hub/payment-methods/usePaymentMethods";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";

import NoMessagesFound from "components/emptyData/NoMessagesFound";

import DeletePaymentConfirmation from "components/admin/KnowledgeHub/university/paymentMethods/DeletePaymentConfirmation";
import CreatePayment from "components/admin/KnowledgeHub/university/paymentMethods/CreatePayment";

import Loading from "components/loading/Loading";

import { useToast } from "components/context/ToastContext";
import Button from '../../../../ui/buttons/Button';

const PaymentMethodsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { paymentMethods, loading, error } = useAllPaymentMethods();

  const { deletePayment, isDeleting } =useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState<
    string | null
  >(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] =
    useState<string>("");

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPaymentMethods = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return paymentMethods.filter((university) => {
      const matchSearch =
        !term ||
        university.name?.toLowerCase().includes(term)

      const matchField =
        selectedField === "all" ||
        (university as any).field_id === selectedField;

      return matchSearch && matchField;
    });
  }, [paymentMethods, searchTerm, selectedState, selectedField]);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const sortedPaymentMethods = React.useMemo(() => {
    if (!sortConfig.key) return filteredPaymentMethods;

    return [...filteredPaymentMethods].sort((a, b) => {

      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (!aValue && !bValue) return 0;

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue || "")
          : (bValue || "").localeCompare(aValue || "");
      }

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [filteredPaymentMethods, sortConfig]);
  const currentPaymentMethods = sortedPaymentMethods.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
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

      showToast(" Payment Method deleted successfully.");

      setIsDeleteOpen(false);
      setSelectedPaymentId(null);
      setSelectedPaymentMethodName("");

      setTimeout(() => location.reload(), 2000);

    } catch (error: any) {
      showToast("Failed to delete university. Please try again.");
    }
  };

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all Payment Methods, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
              <input
                type="text"
                placeholder="Search by university name or level"
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-white w-full rounded-full border border-gray-300 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-600 outline-0 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setSelectedField("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>

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
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">

        <div className="block">

          <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
            <table className="w-full">

              <thead>
              <tr className="border-b border-slate-200 bg-card">

                <th
                  className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors "
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span>Payment Method</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                  <div className="flex items-center gap-2 min-w-[150px]">
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
              </tr>
              </thead>

              <tbody className="divide-border-slate-200 divide-y bg-primary">

              {loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Loading text="Fetching Payment Methods data..." />
                  </td>
                </tr>
              )}

              {!error && !loading && currentPaymentMethods.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <NoMessagesFound
                      title="No Payment Methods found"
                      subtitle="There are currently no Payment Methods available."
                    />
                  </td>
                </tr>
              )}

              {!error && currentPaymentMethods.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-primary/10 group transition-colors"
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                      >
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
                    <div className="flex items-center gap-3">

                      <div className="w-full min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {payment.description}
                        </h3>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        role="menuitem"
                        aria-label="View Payment Method"
                        href={`/admin/universities/payment-methods/${payment.id}`}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>


                      <div className="h-6 border-l border-slate-200" />

                      <a
                        role="menuitem"
                        aria-label="Edit Payment Method"
                        href={`/admin/universities/payment-methods/${payment.id}/edit`}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete Payment Method"
                        onClick={() => {
                          setSelectedPaymentId(payment.id);
                          setSelectedPaymentMethodName(payment.name);
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              </tbody>
            </table>

          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
            {paymentMethods.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                to
                <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, paymentMethods.length)}
                    </span>
                of
                <span className="font-medium">{paymentMethods.length}</span>
                Payment Methods
              </div>
            )}

            <div className="flex justify-end gap-2">
              <PrevButton
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                text="Prev"
                icon={<ArrowLeft className="h-4 w-4" />}
              />

              <span className="px-3 py-1 font-medium text-slate-500">
                    Page {currentPage} of{" "}
                {Math.ceil(paymentMethods.length / itemsPerPage)}
                  </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(paymentMethods.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(paymentMethods.length / itemsPerPage)
                }
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
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
      />

    </div>
  );
};

export default PaymentMethodsTable;
