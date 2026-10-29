"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, Settings, Pencil, Book, Layers } from "lucide-react";
import { MdLabelOutline } from "react-icons/md";

import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";

import SearchInput from "components/ub/forms/SearchInput";

import CreateFieldOfStudy from "features/universities/components/admin/fields-of-study/popups/CreateFieldOfStudy";
import UpdateField from "features/universities/components/admin/fields-of-study/popups/UpdateField";

import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";

const ITEMS_PER_PAGE = 10;

const DataEntryFieldsOfStudyTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { fields, fieldsLoading, fieldsError, refetch } = useAllFields();

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const filteredFieldOfStudy = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return fields.filter((field) => !term || field.name?.toLowerCase().includes(term));
  }, [fields, searchTerm]);

  const currentFieldOfStudy = filteredFieldOfStudy.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Fields of Study</h3>
          <p className="mt-1 text-sm text-slate-500">Manage all available fields of study</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={fieldsLoading}
          icon={<Book className="h-5 w-5" />}
          text="Create Field"
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
            <Book className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{fields.length}</p>
            <p className="text-xs text-slate-500">Total Fields of Study</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by field name..."
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
            itemCount={currentFieldOfStudy.length}
            totalCount={filteredFieldOfStudy.length}
            itemLabel="Fields"
            loading={fieldsLoading}
          />
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="group min-w-[250px] px-6 py-4 text-start font-bold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-slate-500" />
                  <span>Field of Study</span>
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex min-w-[150px] items-center gap-2">
                  <MdLabelOutline className="h-4 w-4 text-slate-500" />
                  <span>Code</span>
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

          <tbody className="divide-y divide-slate-200 bg-white">
            {fieldsLoading && <TableSkeletonRows columns={3} rows={ITEMS_PER_PAGE} />}

            {!fieldsLoading && fieldsError && (
              <TableErrorRow colSpan={3} message={fieldsError} />
            )}

            {!fieldsLoading && !fieldsError && currentFieldOfStudy.length === 0 && (
              <TableEmptyRow
                colSpan={3}
                title="No fields found"
                subtitle="There are currently no fields of study available."
                icon={<Layers className="h-8 w-8 text-slate-400" />}
              />
            )}

            <AnimatePresence>
            {!fieldsLoading && !fieldsError && currentFieldOfStudy.map((field) => (
              <AnimatedTableRow key={field.id} className="transition-colors hover:bg-slate-100/50">
                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-blue-700">
                      <Book className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="w-full min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{field.name}</h3>
                    </div>
                  </div>
                </td>

                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <p className="truncate text-sm text-slate-600">{field.code ?? "Not provided"}</p>
                </td>

                <td className="px-6 py-4">
                  <IconButton
                    aria-label="Edit Field of Study"
                    onClick={() => { setSelectedField(field); setIsUpdateOpen(true); }}
                    icon={<Pencil className="h-4 w-4 text-slate-500" />}
                    bgColor="bg-transparent"
                    textColor="text-slate-700"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-slate-700"
                    hoverBorderColor="hover:border-transparent"
                    className="hover:bg-slate-100 focus:outline-none"
                  />
                </td>
              </AnimatedTableRow>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </TableWrapper>

      <UpdateField
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        selectedField={selectedField}
        onSuccess={refetch}
      />

      <CreateFieldOfStudy
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default DataEntryFieldsOfStudyTable;
