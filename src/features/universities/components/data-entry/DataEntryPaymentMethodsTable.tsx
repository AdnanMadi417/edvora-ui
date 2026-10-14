"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronRight, Pencil, Settings, CreditCard } from "lucide-react";
import { MdOutlineCategory } from "react-icons/md";
import { useRouter } from "next/navigation";

import { useAllPaymentMethods } from "features/knowledge-hub/payment-methods/hooks";

import SearchInput from "components/form/filter/SearchInput";
import CreatePayment from "features/universities/components/admin/payment-methods/popups/CreatePayment";
import Button from "components/ui/buttons/Button";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import { AnimatedTableRow } from "components/ui/motion";

const ITEMS_PER_PAGE = 10;

const DataEntryPaymentMethodsTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { paymentMethods, loading, error, refetch } = useAllPaymentMethods();

  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const filteredPaymentMethods = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return paymentMethods.filter((payment) => !term || payment.name?.toLowerCase().includes(term));
  }, [paymentMethods, searchTerm]);

  const currentPaymentMethods = filteredPaymentMethods.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredPaymentMethods.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredPaymentMethods, currentPage]);

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">

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

      {/* Search */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by payment method name..."
        />
        <Button
          onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
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

      <TableWrapper
        footer={
          <TablePagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            itemCount={currentPaymentMethods.length}
            totalCount={filteredPaymentMethods.length}
            itemLabel="Payment Methods"
            loading={loading}
          />
        }
      >
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
            {loading && <TableSkeletonRows columns={4} rows={ITEMS_PER_PAGE} />}

            {!loading && error && (
              <TableErrorRow colSpan={4} message={error} />
            )}

            {!loading && !error && currentPaymentMethods.length === 0 && (
              <TableEmptyRow
                colSpan={4}
                title="No Payment Methods found"
                subtitle="There are currently no Payment Methods available."
                icon={<CreditCard className="h-8 w-8 text-slate-400" />}
              />
            )}

            <AnimatePresence>
            {!loading && !error && currentPaymentMethods.map((payment) => (
              <AnimatedTableRow
                key={payment.id}
                className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                onClick={() => router.push(`/data-entry/payment-methods/${payment.id}/edit`)}
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
                  <a
                    role="menuitem"
                    aria-label="Edit Payment Method"
                    href={`/data-entry/payment-methods/${payment.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-fit items-center justify-center rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                  >
                    <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  </a>
                </td>

                <td className="w-8 pr-4 py-4">
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </td>
              </AnimatedTableRow>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </TableWrapper>

      <CreatePayment
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default DataEntryPaymentMethodsTable;
