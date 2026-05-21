"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  Pencil,
  Trash2,
  Book,
} from "lucide-react";
import { MdLabelOutline } from 'react-icons/md';

import { useDeleteField } from "hooks/knowledge-hub/field-of-study/useDeleteField";
import { useAllFields } from "hooks/knowledge-hub/field-of-study/useFieldsList";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";

import NoMessagesFound from "components/emptyData/NoMessagesFound";

import DeleteFieldConfirmation from "components/admin/configUniversities/FieldsOfStudy/popups/DeleteFieldConfirmation";
import CreateFieldOfStudy from "components/admin/configUniversities/FieldsOfStudy/popups/CreateFieldOfStudy";
import UpdateField from "components/admin/configUniversities/FieldsOfStudy/popups/UpdateField";

import Loading from "components/loading/Loading";

import { useToast } from "components/context/ToastContext";
import Button from "components/ui/buttons/Button";

const FieldsOfStudyTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { fields, fieldsLoading, fieldsError, refetch } = useAllFields();

  const { deleteField, isDeleting } = useDeleteField();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    null
  );
  const [selectedFieldName, setSelectedFieldName] =
    useState<string>("");
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredFieldOfStudy = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return fields.filter((field) => {
      const matchSearch =
        !term || field.name?.toLowerCase().includes(term);

      return matchSearch;
    });
  }, [fields, searchTerm]);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const sortedFieldOfStudy = React.useMemo(() => {
    if (!sortConfig.key) return filteredFieldOfStudy;

    return [...filteredFieldOfStudy].sort((a, b) => {
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
  }, [filteredFieldOfStudy, sortConfig]);
  const currentFieldOfStudy = sortedFieldOfStudy.slice(
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
    const totalPages = Math.ceil(filteredFieldOfStudy.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
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
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Failed to Field of study university. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Field Of Study
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all fields, and learning resources
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
              <input
                type="text"
                placeholder="Search by Field name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 pl-10 pr-4 text-sm text-slate-600 outline-0 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setSelectedField("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>

            <Button
              onClick={() => setIsCreateOpen(true)}
              disabled={fieldsLoading}
              icon={<Book className="h-5 w-5" />}
              text="Create new Field"
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
                  <th className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors ">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-slate-500" />
                      <span>Field Of Study</span>
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

              <tbody className="divide-border-slate-200 divide-y bg-primary">
                {fieldsLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center">
                      <Loading text="Fetching Fields of studies data..." />
                    </td>
                  </tr>
                )}

                {!fieldsError && !fieldsLoading && currentFieldOfStudy.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center">
                      <NoMessagesFound
                        title="No Field found"
                        subtitle="There are currently no Field of study available."
                      />
                    </td>
                  </tr>
                )}

                {!fieldsError &&
                  currentFieldOfStudy.map((field) => (
                    <tr
                      key={field.id}
                      className="hover:bg-primary/10 group transition-colors"
                    >
                      <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-md bg-accent-light text-h6 font-medium text-blue-700 "
                          >
                            <Book className="h-5 w-5 text-blue-700" />
                          </div>

                          <div className="w-full min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {field.name}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {field.code ?? "Not provided"}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          <button
                            role="menuitem"
                            aria-label="Update Field of study"
                            onClick={() => {
                              setSelectedField(field);
                              setIsUpdateOpen(true);
                            }}
                            className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                          >
                            <Pencil className="h-4 w-4 text-slate-500 hover:text-red-600" />
                          </button>

                          <div className="h-6 border-l border-slate-200" />

                          <button
                            role="menuitem"
                            aria-label="Delete Field of study"
                            onClick={() => {
                              setSelectedFieldId(field.id);
                              setSelectedFieldName(field.name);
                              setIsDeleteOpen(true);
                            }}
                            className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
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
            {fields.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                to
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, fields.length)}
                </span>
                of
                <span className="font-medium">{fields.length}</span>
                Field of study
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
                Page {currentPage} of{" "}
                {Math.ceil(fields.length / itemsPerPage)}
              </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(fields.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(fields.length / itemsPerPage)
                }
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
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
