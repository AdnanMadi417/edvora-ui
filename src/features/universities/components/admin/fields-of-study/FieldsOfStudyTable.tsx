"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  Pencil,
  Trash2,
  Book,
  Layers,
} from "lucide-react";
import { MdLabelOutline } from "react-icons/md";

import { useDeleteField, useAllFields } from "features/knowledge-hub/field-of-study/hooks";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import SearchInput from "components/form/filter/SearchInput";

import NoMessagesFound from "components/emptyData/NoMessagesFound";

import DeleteFieldConfirmation from "features/universities/components/admin/fields-of-study/popups/DeleteFieldConfirmation";
import CreateFieldOfStudy from "features/universities/components/admin/fields-of-study/popups/CreateFieldOfStudy";
import UpdateField from "features/universities/components/admin/fields-of-study/popups/UpdateField";

import Loading from "components/loading/Loading";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";

const FieldsOfStudyTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { fields, fieldsLoading, fieldsError, refetch } = useAllFields();

  const { deleteField, isDeleting } = useDeleteField();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldName, setSelectedFieldName] = useState<string>("");
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredFieldOfStudy = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return fields.filter((field) => !term || field.name?.toLowerCase().includes(term));
  }, [fields, searchTerm]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "",
    direction: "asc",
  });

  const sortedFieldOfStudy = React.useMemo(() => {
    if (!sortConfig.key) return filteredFieldOfStudy;
    return [...filteredFieldOfStudy].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (!aValue && !bValue) return 0;
      if (typeof aValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue || "") : (bValue || "").localeCompare(aValue || "");
      }
      if (typeof aValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [filteredFieldOfStudy, sortConfig]);

  const currentFieldOfStudy = sortedFieldOfStudy.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedState, selectedField]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredFieldOfStudy.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredFieldOfStudy, currentPage]);

  const handleDelete = async () => {
    if (!selectedFieldId) return;
    try {
      await deleteField(selectedFieldId);
      showToast("Field of study deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedFieldId(null);
      setSelectedFieldName("");
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to delete field of study. ${backendMessage}`, "error");
    }
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

      {/* Search & Filters */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by field name..."
        />
        <Button
          onClick={() => { setSearchTerm(""); setSelectedState("all"); setCurrentPage(1); }}
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
              {fieldsLoading && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Loading text="Fetching fields of study..." />
                  </td>
                </tr>
              )}

              {!fieldsError && !fieldsLoading && currentFieldOfStudy.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <NoMessagesFound
                      title="No fields found"
                      subtitle="There are currently no fields of study available."
                      icon={<Layers className="h-8 w-8 text-slate-400" />}
                    />
                  </td>
                </tr>
              )}

              {!fieldsError && currentFieldOfStudy.map((field) => (
                <tr key={field.id} className="transition-colors hover:bg-slate-100/50">
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
                    <div className="flex items-center gap-2">
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

                      <div className="h-6 border-l border-slate-200" />

                      <IconButton
                        aria-label="Delete Field of Study"
                        onClick={() => { setSelectedFieldId(field.id); setSelectedFieldName(field.name); setIsDeleteOpen(true); }}
                        icon={<Trash2 className="h-4 w-4 text-slate-500" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-700"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-slate-100 focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:justify-between">
          {fields.length > 0 && (
            <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
              Showing
              <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
              to
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, fields.length)}</span>
              of
              <span className="font-medium">{fields.length}</span>
              Fields
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
              Page {currentPage} of {Math.ceil(fields.length / itemsPerPage)}
            </span>
            <NextButton
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(fields.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(fields.length / itemsPerPage)}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <DeleteFieldConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        FieldName={selectedFieldName}
      />

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

export default FieldsOfStudyTable;
