"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ChevronRight,
  Pencil,
  Settings,
  Building2,
  PhoneCall,
  UserRound,
  Camera,
  MapPin,
  PlusCircle,
  BadgeCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useUniversityTypes } from "features/universities/hooks";

import Button from "components/ui/buttons/Button";
import SearchInput from "components/form/filter/SearchInput";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";

const ITEMS_PER_PAGE = 10;

const DataEntryUniversityConfigurationTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { universities, loading, error } = useUniversityTypes();

  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const isFieldRequired = (requiredFields: any[], fieldKey: string) =>
    requiredFields?.some((f) => f.field_key === fieldKey && f.is_required);

  const filteredUniversities = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return universities.filter((university) => !term || university.name?.toLowerCase().includes(term));
  }, [universities, searchTerm]);

  const currentUniversities = filteredUniversities.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredUniversities, currentPage]);

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">University Configuration</h3>
          <p className="mt-1 text-sm text-slate-500">Manage submission requirements for each university type</p>
        </div>
        <Button
          onClick={() => router.push("/data-entry/university-configuration/create")}
          icon={<PlusCircle className="h-5 w-5" />}
          text="Create Type"
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Building2 className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{universities.length}</p>
            <p className="text-xs text-slate-500">Total University Types</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by university type name..."
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
            itemCount={currentUniversities.length}
            totalCount={filteredUniversities.length}
            itemLabel="types"
            loading={loading}
          />
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="group min-w-[220px] px-6 py-4 text-start font-bold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span>University</span>
                </div>
              </th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-500" />
                  <span>Number</span>
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
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <span>Gender</span>
                </div>
              </th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-500" />
                  <span>Photo</span>
                </div>
              </th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex min-w-[120px] items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-slate-500" />
                  <span>English Cert</span>
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
            {loading && <TableSkeletonRows columns={8} rows={ITEMS_PER_PAGE} />}

            {!loading && error && (
              <TableErrorRow colSpan={8} message={error} />
            )}

            {!loading && !error && currentUniversities.length === 0 && (
              <TableEmptyRow
                colSpan={8}
                title="No university types found"
                subtitle="There are currently no university types available."
              />
            )}

            {!loading && !error && currentUniversities.map((uni) => (
              <tr
                key={uni.id}
                className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                onClick={() => router.push(`/data-entry/university-configuration/${uni.id}/edit`)}
              >
                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-h6 font-medium text-blue-700">
                      {uni ? uni.name?.slice(0, 2).toUpperCase() : <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-200" />}
                    </div>
                    <div className="w-full min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{uni.name}</h3>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {isFieldRequired(uni.required_fields, "student.phone")
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {isFieldRequired(uni.required_fields, "student.current_address")
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {isFieldRequired(uni.required_fields, "student.gender")
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {isFieldRequired(uni.required_fields, "student.english_proficiencies")
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {isFieldRequired(uni.required_fields, "student.photo")
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <a
                    role="menuitem"
                    aria-label="Edit University Type"
                    href={`/data-entry/university-configuration/${uni.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-fit items-center justify-center rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                  >
                    <Pencil className="h-4 w-4 text-slate-500" />
                  </a>
                </td>

                <td className="w-8 pr-4 py-4">
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
};

export default DataEntryUniversityConfigurationTable;
