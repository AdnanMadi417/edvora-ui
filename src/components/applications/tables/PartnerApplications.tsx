'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Flag,
  Clock,
  User,
  BadgeCheck,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  UserSearch,
  GitBranch,
  FilePlus,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { MdSchool } from 'react-icons/md';

import { useRouter } from 'next/navigation';
import api from 'lib/useApi';
import Cookies from 'js-cookie';

import EmptyData from 'components/emptyData/EmptyTableData';
import NextButton from 'components/ui/buttons/NextButton';
import PrevButton from 'components/ui/buttons/PrevButton';
import ClearButton from 'components/ui/buttons/DangerButton';
import Button from 'components/ui/buttons/Button';
import FilterSelectField from 'components/form/filter/FilterSelectField';

import { useAllUniversities } from 'hooks/knowledge-hub/universities/useUniversitiesList';
import { useAllStages } from 'hooks/applications/stages/useStages';
import { useAllStageStatuses } from 'hooks/applications/stages/useStageStatuses';

// Statuses that require the partner to take action
const PARTNER_ACTION_STATUSES = new Set([
  'correction_requested_by_account_manager',
  'waiting_for_payment',
  'waiting_partner_to_confirm_arrival_date',
]);

const needsPartnerAction = (status: string) =>
  PARTNER_ACTION_STATUSES.has(status?.toLowerCase().replace(/\s+/g, '_'));

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
    </td>
    <td className="px-4 py-4" />
  </tr>
);

const PartnerApplications = () => {

  const [applications, setApplications] = useState([]);
  const { universities } = useAllUniversities();
  const { stages } = useAllStages();
  const { stageStatuses, stageStatusesLoading } = useAllStageStatuses();

  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedStages, setSelectedStages] = useState<string>('all');
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>('all');

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = Cookies.get('token');
        const partnerId = localStorage.getItem('partnerId');

        if (!token || !partnerId) {
          console.error('Missing token or partnerId', { token, partnerId });
          return;
        }

        const res = await api.get(`/partners/${partnerId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setApplications(res.data.items.map((app: any) => ({ ...app })));
      } catch (err: any) {
        console.error('Error fetching partner applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUniversity, selectedStages, selectedStageStatus]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const activeFiltersCount = [
    selectedUniversity !== 'all',
    selectedStages !== 'all',
    selectedStageStatus !== 'all',
    searchTerm !== '',
  ].filter(Boolean).length;

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.student_name?.toLowerCase() ?? '').includes(term) ||
          (app.student_email?.toLowerCase() ?? '').includes(term) ||
          (app.partner_name?.toLowerCase() ?? '').includes(term) ||
          (app.account_manager_name?.toLowerCase() ?? '').includes(term) ||
          (app.program_name?.toLowerCase() ?? '').includes(term) ||
          (app.university_name?.toLowerCase() ?? '').includes(term),
      );
    }

    if (selectedStageStatus !== 'all' && !stageStatusesLoading) {
      filtered = filtered.filter(
        (app) => app.status?.toLowerCase().replace(/\s+/g, '_') === selectedStageStatus,
      );
    }

    if (selectedStages !== 'all') {
      filtered = filtered.filter(
        (app) => app.stage?.toLowerCase() === selectedStages.toLowerCase(),
      );
    }

    if (selectedUniversity !== 'all') {
      filtered = filtered.filter(
        (app) => app.university_name?.toLowerCase() === selectedUniversity.toLowerCase(),
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() ?? '';
        const bVal = b[sortConfig.key]?.toString().toLowerCase() ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    applications,
    searchTerm,
    selectedUniversity,
    selectedStages,
    selectedStageStatus,
    sortConfig,
    stageStatusesLoading,
  ]);

  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, any> = {
      new_application: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
        label: 'New Application',
      },
      under_review_by_account_manager: {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
        label: 'Under Review',
      },
      correction_requested_by_account_manager: {
        bg: 'bg-orange-50 border-orange-200',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        label: 'Correction Requested',
      },
      approved_from_stage_1: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-700',
        dot: 'bg-green-500',
        label: 'Approved',
      },
      rejected: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        dot: 'bg-red-500',
        label: 'Rejected',
      },
    };

    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    const config = statusConfig[normalizedStatus] || {
      bg: 'bg-gray-100 border-gray-200',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
      label: status || 'Unknown',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
        title={config.label}
      >
        <span className="truncate max-w-[160px]">{config.label}</span>
      </span>
    );
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) {
      return (
        <ChevronUp className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-accent" />
    ) : (
      <ChevronDown className="h-4 w-4 text-accent" />
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedUniversity('all');
    setSelectedStages('all');
    setSelectedStageStatus('all');
    setSortConfig({ key: null, direction: 'asc' });
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-4 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">

          {/* Header row: title + primary action */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Applications Dashboard</h3>
              <p className="mt-0.5 text-sm text-slate-500">Manage and track student applications</p>
            </div>
            <Button
              onClick={() => router.push('/partner/applications/apply-now')}
              icon={<FilePlus className="h-4 w-4" />}
              text="Create Application"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="shrink-0 !bg-blue-600 hover:!bg-blue-700"
            />
          </div>

          {/* Filter bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-3">
            {/* Search + mobile filter toggle */}
            <div className="flex items-center gap-2 sm:contents">
              <div className="relative flex-1 sm:w-64 sm:flex-none flex-shrink-0">
                <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 text-sm text-slate-700 outline-0 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-background text-slate-500 hover:bg-slate-50"
                onClick={() => setShowMobileFilters((v) => !v)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter selects — collapsible on mobile, always visible on sm+ */}
            <div className={`flex-col gap-3 sm:contents ${showMobileFilters ? 'flex' : 'hidden sm:contents'}`}>
              <div className="w-full sm:w-44 flex-shrink-0">
                <FilterSelectField
                  value={selectedStages}
                  onChange={(val: string) => setSelectedStages(val)}
                  options={stages}
                  icon={GitBranch}
                  defaultOption="All Stages"
                />
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedUniversity}
                  onChange={(val: string) => setSelectedUniversity(val)}
                  options={universities}
                  icon={MdSchool}
                  defaultOption="All Universities"
                />
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedStageStatus}
                  onChange={(val: string) => setSelectedStageStatus(val)}
                  options={stageStatuses.map((s) => ({
                    label: s.name,
                    value: s.name.toLowerCase().replace(/\s+/g, '_'),
                  }))}
                  icon={BadgeCheck}
                  defaultOption={stageStatusesLoading ? 'Loading...' : 'All Statuses'}
                />
              </div>

              {activeFiltersCount > 0 && (
                <div className="relative flex-shrink-0">
                  <ClearButton
                    onClick={handleClearFilters}
                    text="Clear"
                    icon={<RotateCcw className="h-4 w-4" />}
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-md bg-red-500 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden rounded-lg rounded-b-none border border-b-0 border-gray-200 bg-card divide-y divide-gray-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-gray-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-28 animate-pulse rounded-md bg-gray-200" />
              </div>
            </div>
          ))
        ) : paginatedApplications.length === 0 ? (
          <div className="px-6 py-8 text-center"><EmptyData /></div>
        ) : (
          paginatedApplications.map((app) => (
            <div
              key={app.id}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 ${
                needsPartnerAction(app.status) ? 'border-l-2 border-l-amber-400 bg-amber-50/30' : ''
              }`}
              onClick={() => router.push(`/partner/applications/${app.id}`)}
            >
              <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {app.student_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                {needsPartnerAction(app.status) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-md bg-amber-400 ring-2 ring-white">
                    <span className="h-1.5 w-1.5 rounded-md bg-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{app.student_name}</span>
                  <span className="shrink-0 text-xs text-slate-400">{getRelativeTime(app.updated_at)}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-500">{app.program_name}</div>
                <div className="mt-1.5"><StatusBadge status={app.status} /></div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-gray-200 bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-card">
              <th
                onClick={() => handleSort('student_name')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  Student
                  <SortIndicator field="student_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort('program_name')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  University / Program
                  <SortIndicator field="program_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort('stage')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-slate-400" />
                  Stage / Status
                  <SortIndicator field="stage" />
                </div>
              </th>

              <th
                onClick={() => handleSort('updated_at')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-[100px] items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Updated
                  <SortIndicator field="updated_at" />
                </div>
              </th>

              <th className="w-10 px-4 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-card">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedApplications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  <EmptyData />
                </td>
              </tr>
            ) : (
              paginatedApplications.map((app) => (
                <tr
                  key={app.id}
                  className={`group cursor-pointer transition-colors hover:bg-slate-50 ${
                    needsPartnerAction(app.status) ? 'border-l-2 border-l-amber-400 bg-amber-50/30' : ''
                  }`}
                  onClick={() => router.push(`/partner/applications/${app.id}`)}
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                          {app.student_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        {needsPartnerAction(app.status) && (
                          <span
                            className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-md bg-amber-400 ring-2 ring-white"
                            title="Action required"
                          >
                            <span className="h-1.5 w-1.5 rounded-md bg-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900 truncate">{app.student_name}</div>
                        <div className="truncate text-xs text-slate-500 truncate">{app.student_email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="font-medium text-slate-900 truncate">{app.program_name}</div>
                    <div className="truncate text-xs text-slate-500 truncate">{app.university_name}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500 truncate">{app.stage}</div>
                      <StatusBadge status={app.status} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      {getRelativeTime(app.updated_at)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 rounded-b-lg border border-gray-200 bg-card px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
          <div>
            {filteredAndSortedApplications.length === 0 ? (
              <span>No results found</span>
            ) : (
              <>
                Showing{' '}
                <span className="font-medium text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-700">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedApplications.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-700">
                  {filteredAndSortedApplications.length}
                </span>{' '}
                results
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PrevButton
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              text="Prev"
              icon={<ArrowLeft className="h-4 w-4" />}
            />
            <span className="px-2 text-slate-500">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
            <NextButton
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerApplications;
