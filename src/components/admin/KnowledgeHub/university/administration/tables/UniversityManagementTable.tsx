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
  Globe,
  Phone,
  Users,
  Image,
  MapPin, GraduationCap,
} from 'lucide-react';
import { MdOutlineCategory, MdSchool, MdVerified } from "react-icons/md";

import CreateUniversityType from "components/admin/configUniversities/popups/CreateUniversityType";

import { useUniversityTypes } from "hooks/knowledge-hub/config-universities/useUniversityTypesQuery";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";


import NoMessagesFound from "components/emptyData/NoMessagesFound";

import Loading from "components/loading/Loading";

import { useToast } from "components/context/ToastContext";
import Button from '../../../../../ui/buttons/Button';

const UniversityManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { universities, loading, error } = useUniversityTypes();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredUniversities = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return universities.filter((university) => {
      const matchSearch =
        !term || university.name?.toLowerCase().includes(term);

      const matchField =
        selectedField === "all" ||
        (university as any).field_id === selectedField;

      return matchSearch && matchField;
    });
  }, [universities, searchTerm, selectedState, selectedField]);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const sortedUniversities = React.useMemo(() => {
    if (!sortConfig.key) return filteredUniversities;

    return [...filteredUniversities].sort((a, b) => {
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
  }, [filteredUniversities, sortConfig]);
  const currentUniversities = sortedUniversities.slice(
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
    const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredUniversities, currentPage]);

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                University Configuration
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage submission requirements for each university. Click a
                university row to edit its configuration.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, University, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              disabled={loading}
              icon={<GraduationCap  className="h-5 w-5" />}
              text={loading ? "Creating..." : "Create University"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />

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
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="block">
          <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-card">
                  <th className="group min-w-[220px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-secondary">
                    <div className="flex items-center gap-2">
                      <MdSchool className="h-4 w-4 text-slate-500" />
                      <span>University</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex min-w-[150px] items-center gap-2">
                      <MdOutlineCategory className="h-4 w-4 text-slate-500" />
                      <span>Type</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>Phone</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>Address</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Parent</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-slate-500" />
                      <span>Photo</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                    <div className="flex min-w-[180px] items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span>English Certificate</span>
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
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <Loading text="Fetching Universities data..." />
                    </td>
                  </tr>
                )}

                {!error && !loading && currentUniversities.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <NoMessagesFound
                        title="No universities found"
                        subtitle="There are currently no universities available."
                      />
                    </td>
                  </tr>
                )}

                {!error &&
                  currentUniversities.map((uni) => (
                    <tr
                      key={uni.id}
                      className="hover:bg-primary/10 group transition-colors"
                    >
                      <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                          >
                            {uni ? (
                              uni.name?.slice(0, 2).toUpperCase()
                            ) : (
                              <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
                            )}
                          </div>

                          <div className="w-full min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {uni.name}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-start">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Type One
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="rounded-lg bg-green-50 p-1.5 text-green-600 backdrop-blur-md">
                            <MdVerified className="h-4 w-4" />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="rounded-lg bg-green-50 p-1.5 text-green-600 backdrop-blur-md">
                            <MdVerified className="h-4 w-4" />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="rounded-lg bg-green-50 p-1.5 text-green-600 backdrop-blur-md">
                            <MdVerified className="h-4 w-4" />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="rounded-lg bg-green-50 p-1.5 text-green-600 backdrop-blur-md">
                            <MdVerified className="h-4 w-4" />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="rounded-lg bg-green-50 p-1.5 text-green-600 backdrop-blur-md">
                            <MdVerified className="h-4 w-4" />
                          </div>
                        </div>
                      </td>

                      {/*<td className="px-6 py-4">*/}
                      {/*  <div className="flex justify-center">*/}
                      {/*    <div*/}
                      {/*      className={`rounded-lg p-1.5 backdrop-blur-md ${*/}
                      {/*        uni.is_active*/}
                      {/*          ? "bg-green-50 text-green-600"*/}
                      {/*          : "bg-slate-50 text-slate-400"*/}
                      {/*      }`}*/}
                      {/*    >*/}
                      {/*      {uni.is_active? (*/}
                      {/*        <MdVerified className="h-4 w-4" />*/}
                      {/*      ) : (*/}
                      {/*        <MdCancel  className="h-4 w-4" />*/}
                      {/*      )}*/}
                      {/*    </div>*/}
                      {/*  </div>*/}
                      {/*</td>*/}

                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <a
                            role="menuitem"
                            aria-label="View University"
                            href={`/admin/config-universities/${uni.id}`}
                            className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                          >
                            <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                          </a>

                          <div className="h-6 border-l border-slate-200" />

                          <a
                            role="menuitem"
                            aria-label="Edit University"
                            href={`/admin/config-universities/${uni.id}/edit`}
                            className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                          >
                            <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                          </a>

                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
            {universities.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                to
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, universities.length)}
                </span>
                of
                <span className="font-medium">{universities.length}</span>
                Universities
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
                {Math.ceil(universities.length / itemsPerPage)}
              </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(universities.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(universities.length / itemsPerPage)
                }
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>

      <CreateUniversityType
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
};

export default UniversityManagementTable;
