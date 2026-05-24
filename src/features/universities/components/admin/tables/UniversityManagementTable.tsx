'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  ChevronRight,
  Pencil,
  Building2,
  PhoneCall,
  UserRound,
  Camera,
  MapPin,
  PlusCircle, Trash2, BadgeCheck,
} from 'lucide-react';
import { CheckCircle, XCircle } from 'lucide-react';

import { useUniversityTypes, useDeleteUniversityType } from "features/universities/hooks";
import DeleteUniversityConfirmation from 'features/universities/components/admin/popups/DeleteUniversityConfirmation';


import NextButton from 'components/ui/buttons/NextButton';
import PrevButton from 'components/ui/buttons/PrevButton';
import Button from 'components/ui/buttons/Button';
import NoMessagesFound from 'components/emptyData/NoMessagesFound';
import Loading from 'components/loading/Loading';
import { useToast } from 'components/context/ToastContext';
import { useRouter } from 'next/navigation';

const UniversityManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const { showToast } = useToast();
  const { deleteUniversityType, isDeleting } = useDeleteUniversityType();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [selectedUniversityName, setSelectedUniversityName] =
    useState<string>('');

  const { universities, loading, error, refetchUniversityTypes } = useUniversityTypes();

  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');

  const isFieldRequired = (
    requiredFields: any[],
    fieldKey: string,
  ) => {
    return requiredFields?.some(
      (f) => f.field_key === fieldKey && f.is_required,
    );
  };

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
        selectedField === 'all' ||
        (university as any).field_id === selectedField;

      return matchSearch && matchField;
    });
  }, [universities, searchTerm, selectedState, selectedField]);

  const [sortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: '',
    direction: 'asc',
  });

  const sortedUniversities = React.useMemo(() => {
    if (!sortConfig.key) return filteredUniversities;

    return [...filteredUniversities].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (!aValue && !bValue) return 0;

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue || '')
          : (bValue || '').localeCompare(aValue || '');
      }

      if (typeof aValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [filteredUniversities, sortConfig]);
  const currentUniversities = sortedUniversities.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedUniversityId) return;

    try {
      await deleteUniversityType(selectedUniversityId);

      showToast('University deleted successfully.', 'success');

      setIsDeleteOpen(false);
      setSelectedUniversityId(null);
      setSelectedUniversityName('');
      refetchUniversityTypes();

    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || 'Please try again.';
      showToast(`Failed to delete university. ${backendMessage}`, 'error');
    }
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

  const handleCreateLink = () => {
    router.push(`/admin/config-universities/create`);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleCreateLink}
              icon={<PlusCircle  className="h-5 w-5" />}
              text={loading ? 'Creating...' : 'Create Type'}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('all');
                setSelectedField('all');
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-gray-200 bg-white">
            <table className="w-full">

              <thead>
              <tr className="border-b border-slate-200 bg-white ">

                <th
                  className="group min-w-[220px] px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors">
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
                  <div className="flex items-center gap-2 min-w-[120px]">
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

              </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
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
                    className="group cursor-pointer bg-white transition-colors hover:bg-slate-50"
                    onClick={() => router.push(`/admin/config-universities/${uni.id}`)}
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
                            <div className="h-5 w-5 animate-pulse rounded-md bg-gray-300" />
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
                      <div className="flex justify-center">
                        {isFieldRequired(uni.required_fields, 'student.phone') ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isFieldRequired(
                          uni.required_fields,
                          'student.current_address',
                        ) ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isFieldRequired(uni.required_fields, 'student.gender') ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isFieldRequired(uni.required_fields, 'student.english_proficiencies') ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isFieldRequired(uni.required_fields, 'student.photo') ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <a
                          role="menuitem"
                          aria-label="Edit University"
                          href={`/admin/config-universities/${uni.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                        >
                          <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                        </a>

                        <div className="h-6 border-l border-slate-200" />

                        <button
                          role="menuitem"
                          aria-label="Delete University"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUniversityId(uni.id);
                            setSelectedUniversityName(uni.name);
                            setIsDeleteOpen(true);
                          }}
                          className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                        >
                          <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>

      <div className="rounded-b-lg border border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
          <div>
            {filteredUniversities.length === 0 ? (
              <span>No results found</span>
            ) : (
              <>
                Showing{' '}
                <span className="font-medium text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                {' '}to{' '}
                <span className="font-medium text-slate-700">
                  {Math.min(currentPage * itemsPerPage, filteredUniversities.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium text-slate-700">{filteredUniversities.length}</span>
                {' '}Universities
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PrevButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              text="Prev"
              icon={<ArrowLeft className="h-4 w-4" />}
            />
            <span className="px-2 text-slate-500">
              Page {currentPage} of{' '}
              {Math.max(Math.ceil(filteredUniversities.length / itemsPerPage), 1)}
            </span>
            <NextButton
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredUniversities.length / itemsPerPage),
                  ),
                )
              }
              disabled={
                currentPage === Math.ceil(filteredUniversities.length / itemsPerPage) ||
                filteredUniversities.length === 0
              }
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <DeleteUniversityConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        universityName={selectedUniversityName}
      />

    </div>
  );
};

export default UniversityManagementTable;
