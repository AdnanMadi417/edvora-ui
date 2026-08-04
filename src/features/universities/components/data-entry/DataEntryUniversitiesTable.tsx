"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, RefreshCw } from "lucide-react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import PresignedImage from "components/ui/PresignedImage";
import { useUniversities } from "features/universities/hooks";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import SearchInput from "components/form/filter/SearchInput";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import Loading from "components/loading/Loading";

export default function DataEntryUniversitiesTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { universities, loading, error, refetch } = useUniversities({ includeInactive: true });

  const filtered = universities.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.country?.toLowerCase().includes(term);
  });

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Universities</h3>
          <p className="mt-0.5 text-sm text-slate-500">Create and edit university records</p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          text="New University"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
          onClick={() => router.push("/data-entry/universities/create")}
          className="whitespace-nowrap"
        />
      </div>

      {/* Search */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by name or country..."
            className="sm:w-64 sm:flex-none"
          />
          {loading && (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading && universities.length === 0 ? (
          <Loading text="Loading universities..." />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <NoMessagesFound title="No universities found" subtitle="No universities match your search." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="min-w-[220px] px-6 py-4 text-start text-sm font-semibold text-slate-900">University</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Country</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((uni) => (
                <tr key={uni.id} className="transition-colors hover:bg-slate-100/50">
                  <td className="min-w-[220px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PresignedImage
                        fileKey={uni.logo_file_key}
                        alt={uni.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-200 ring-offset-2"
                        fallback={
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {uni.name?.slice(0, 2).toUpperCase() || "NA"}
                          </div>
                        }
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{uni.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{uni.country || "—"}</td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-3 py-1 text-xs font-semibold ${
                        uni.is_active
                          ? "border-green-600 bg-green-100 text-green-700"
                          : "border-slate-300 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {uni.is_active ? <FaCheckCircle className="text-[10px]" /> : <FaTimesCircle className="text-[10px]" />}
                      {uni.is_active ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <IconButton
                      onClick={() => router.push(`/data-entry/universities/${uni.id}/edit`)}
                      title="Edit university"
                      icon={<Pencil className="h-4 w-4" />}
                      bgColor="bg-transparent"
                      textColor="text-slate-400"
                      borderColor="border-transparent"
                      hoverTextColor="hover:text-slate-700"
                      hoverBorderColor="hover:border-transparent"
                      className="hover:bg-slate-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
