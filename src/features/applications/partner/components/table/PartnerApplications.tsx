'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PresignedImage from 'components/ui/PresignedImage';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Flag,
  Clock,
  User,
  GraduationCap,
  FilePlus,
  ClipboardList,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PipelineCard from 'features/applications/partner/components/PipelineCard';

import { useRouter } from 'next/navigation';
import api from 'lib/useApi';
import { useMe } from 'hooks/useMe';

import EmptyData from 'components/emptyData/EmptyTableData';
import Button from 'components/ui/buttons/Button';
import ApplicationFilterBar from 'components/filters/ApplicationFilterBar';
import { TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from 'components/ui/table';
import { getAsyncStatus } from 'components/ui/async';
import { StatusBadge } from 'components/ui/badges';
import { getStatusVariant } from 'utils/getStatusVariant';

import { useUniversities } from "features/universities/hooks";
import { useAllStages, useAllStageStatuses } from "features/applications/hooks";
import { usePartnerApplications } from "features/applications/partner/hooks/usePartnerApplications";
import { AppDate } from "components/ui/date";


const ACTION_REQUIRED_STATUSES = new Set([
  'correction_requested_by_account_manager',
  'university_requested_corrections',
  'program_change_suggested',
  'waiting_for_payment',
  'payment_rejected',
  'waiting_partner_to_confirm_arrival_date',
  'upload_emgs_eval',
  'eval_re-upload_required',
  'upload_e-visa',
  'e-visa_re-upload_required',
  'upload_visa_stage_documents',
  'visa_documents_re-upload_required',
  'upload_extra_arrival_documents',
  'extra_arrival_documents_re-upload_required',
  'commission_ready',
]);


const PartnerApplications = () => {

  const router = useRouter();
  const [partnerId, setPartnerId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { user } = useMe();
  const { universities } = useUniversities();
  const { stages } = useAllStages();
  const { stageStatuses, stageStatusesLoading } = useAllStageStatuses();

  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedStages, setSelectedStages] = useState<string | null>(null);
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [stageActionRequired, setStageActionRequired] = useState<Record<string, boolean>>({});
  const [selectedLifecycle, setSelectedLifecycle] = useState<'active' | 'hold' | 'cancel' | 'all'>('active');

  const itemsPerPage = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    // The partner id comes from localStorage (set at sign-in) or the shared
    // session, never from a fresh /auth/me call here.
    let id: string | null = null;
    try { id = localStorage.getItem('partnerId'); } catch { /* storage unavailable */ }
    if (!id && user) {
      id = user.partner_id ?? user.id ?? null;
      if (id) { try { localStorage.setItem('partnerId', id); } catch { /* ignore */ } }
    }
    if (id) setPartnerId(id);
  }, [user]);

  useEffect(() => {
    if (stages.length === 0 || !partnerId) return;
    let cancelled = false;
    Promise.all(
      stages.map((s) =>
        api.get(`/partners/${partnerId}/applications`, { params: { stage_id: s.id, limit: 10, status: selectedLifecycle, include_members: true } })
          .then((res) => ({
            id: s.id,
            count: (res.data as any)?.total ?? 0,
            hasAction: ((res.data as any)?.items ?? []).some((app: any) =>
              ACTION_REQUIRED_STATUSES.has(app.status?.toLowerCase().replace(/\s+/g, '_'))
            ),
          }))
          .catch(() => ({ id: s.id, count: 0, hasAction: false }))
      )
    ).then((results) => {
      if (cancelled) return;
      const counts: Record<string, number> = {};
      const actionMap: Record<string, boolean> = {};
      results.forEach((r) => { counts[r.id] = r.count; actionMap[r.id] = r.hasAction; });
      setStageCounts(counts);
      setStageActionRequired(actionMap);
    });
    return () => { cancelled = true; };
  }, [stages.length, partnerId, selectedLifecycle]);

  // include_members: an agency admin sees their members' applications too
  // (D8); the backend ignores it for everyone else.
  const { total: grandTotal } = usePartnerApplications({ partnerId, limit: 1, status: selectedLifecycle, include_members: true });

  const { items: applications, total, loading, error, refetch } = usePartnerApplications({
    partnerId,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    status: selectedLifecycle,
    stage_id: selectedStages ?? undefined,
    stage_status_id: selectedStageStatus !== 'all' ? selectedStageStatus : undefined,
    search: debouncedSearch || undefined,
    university_id: selectedUniversity !== 'all' ? selectedUniversity : undefined,
    include_members: true,
  });

  const submittedByMember = (app: { partner_id?: string | null; partner_name?: string | null }) =>
    app.partner_id && app.partner_id !== partnerId ? app.partner_name || 'a team member' : null;


  const totalActionRequired = useMemo(
    () => stages
      .filter((s) => stageActionRequired[s.id])
      .reduce((sum, s) => sum + (stageCounts[s.id] ?? 0), 0),
    [stages, stageActionRequired, stageCounts]
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const needsPartnerAction = (status: string) =>
    ACTION_REQUIRED_STATUSES.has(status?.toLowerCase().replace(/\s+/g, '_'));

  const activeFiltersCount = [
    selectedUniversity !== 'all',
    selectedStages !== null,
    selectedStageStatus !== 'all',
    selectedLifecycle !== 'active',
    searchTerm !== '',
  ].filter(Boolean).length;

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

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
  }, [applications, selectedUniversity, sortConfig]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications;
  const displayTotal = paginatedApplications.length < itemsPerPage
    ? (currentPage - 1) * itemsPerPage + paginatedApplications.length
    : grandTotal;

  const status = getAsyncStatus(loading, error, paginatedApplications, (r) => r.length === 0);

  const ApplicationStatusBadge = ({ status }: { status: string }) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, '_') ?? '';
    const match = stageStatuses.find((s) => s.name.toLowerCase().replace(/\s+/g, '_') === normalized);
    const label = match?.name ?? (normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown');
    return (
      <StatusBadge variant={getStatusVariant(normalized)} className="max-w-full">
        <span className="truncate max-w-[160px]">{label}</span>
      </StatusBadge>
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
    setSelectedStages(null);
    setSelectedStageStatus('all');
    setSelectedLifecycle('active');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
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

      {grandTotal > 0 && (
        <div className="hidden sm:block p-6 border-b border-slate-200">
          <PipelineCard
            stages={stages}
            stageCounts={stageCounts}
            stageActionRequired={stageActionRequired}
            selectedId={selectedStages}
            onSelect={(id) => { setSelectedStages(id); setCurrentPage(1); }}
            totalCount={grandTotal}
            totalActionRequired={totalActionRequired}
            onViewCommission={() => {
              const commStage = stages.find((s) => s.name.toLowerCase().includes('commission'));
              if (commStage) { setSelectedStages(commStage.id); setCurrentPage(1); }
            }}
          />
        </div>
      )}

      <div className="border-b border-slate-200 p-6">
        <ApplicationFilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          selectedStages={selectedStages ?? 'all'}
          onStagesChange={(val) => {
            setSelectedStages(val === 'all' ? null : val);
            setCurrentPage(1);
          }}
          stageOptions={stages.map((s) => ({ label: s.name, value: s.id }))}
          selectedUniversity={selectedUniversity}
          onUniversityChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
          universityOptions={universities.map((u) => ({ label: u.name, value: u.id }))}
          selectedStageStatus={selectedStageStatus}
          onStageStatusChange={(val) => { setSelectedStageStatus(val); setCurrentPage(1); }}
          stageStatusOptions={stageStatuses.map((s) => ({ label: s.name, value: s.id }))}
          stageStatusLoading={stageStatusesLoading}
          showLifecycleFilter
          selectedLifecycle={selectedLifecycle}
          onLifecycleChange={(val) => { setSelectedLifecycle(val as 'active' | 'hold' | 'cancel' | 'all'); setCurrentPage(1); }}
          resultsCount={displayTotal}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
          showFilters={showMobileFilters}
          onToggleFilters={() => setShowMobileFilters((v) => !v)}
        />
      </div>

      <div className="border-t border-slate-200 p-6">
      <div className="overflow-hidden rounded-lg border border-slate-200">

      <div className="md:hidden divide-y divide-slate-100">
        {status === 'loading' ? (
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
        ) : status === 'error' ? (
          <div className="px-6 py-8 text-center">
            <EmptyData
              title="Something went wrong"
              subtitle={error || 'Please try again.'}
              icon={<AlertCircle className="h-8 w-8 text-red-400" />}
              action={
                <Button
                  onClick={refetch}
                  icon={<RefreshCw className="h-4 w-4" />}
                  text="Retry"
                  bgColor="bg-white"
                  textColor="text-red-600"
                  borderColor="border-red-200"
                  hoverTextColor="hover:text-red-600"
                  hoverBorderColor="hover:border-red-200"
                  className="hover:bg-red-50"
                />
              }
            />
          </div>
        ) : status === 'empty' ? (
          <div className="px-6 py-8 text-center">
            <EmptyData
              title="No applications found"
              subtitle="No applications match your current filters."
              icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
            />
          </div>
        ) : (
          paginatedApplications.map((app) => (
            <div
              key={app.id}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-100/50 ${
                needsPartnerAction(app.status) ? 'border-l-2 border-l-amber-400 bg-amber-50/30' : ''
              }`}
              onClick={() => window.open(`/partner/applications/${app.id}`, "_blank")}
            >
              <div className="relative shrink-0">
                <PresignedImage
                  fileKey={app.student_photo_file_key}
                  alt={app.student_name}
                  className="h-11 w-11 rounded-full object-cover"
                  fallback={
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                      {app.student_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  }
                />
                {needsPartnerAction(app.status) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-md bg-amber-400 ring-2 ring-white">
                    <span className="h-1.5 w-1.5 rounded-md bg-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{app.student_name}</span>
                  <span className="shrink-0 text-xs text-slate-400"><AppDate value={app.updated_at} format="relative" /></span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-500">{app.program_name}</div>
                {submittedByMember(app) && (
                  <div className="mt-0.5 truncate text-xs text-slate-500">By {submittedByMember(app)}</div>
                )}
                <div className="mt-1.5"><ApplicationStatusBadge status={app.status} /></div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                onClick={() => handleSort('student_name')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">Student</span>
                  <SortIndicator field="student_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort('program_name')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">University / Program</span>
                  <SortIndicator field="program_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort('stage')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Flag className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">Stage / Status</span>
                  <SortIndicator field="stage" />
                </div>
              </th>

              <th
                onClick={() => handleSort('updated_at')}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-[100px] items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">Updated</span>
                  <SortIndicator field="updated_at" />
                </div>
              </th>

              <th className="w-10 px-4 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {status === 'loading' && <TableSkeletonRows columns={5} rows={5} />}

            {status === 'error' && <TableErrorRow colSpan={5} message={error ?? undefined} onRetry={refetch} />}

            {status === 'empty' && (
              <TableEmptyRow
                colSpan={5}
                title="No applications found"
                subtitle="No applications match your current filters."
                icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
              />
            )}

            {status === 'success' &&
              paginatedApplications.map((app) => (
                <tr
                  key={app.id}
                  className={`group cursor-pointer transition-colors hover:bg-slate-100/50 ${
                    needsPartnerAction(app.status) ? 'border-l-2 border-l-amber-400 bg-amber-50/30' : ''
                  }`}
                  onClick={() => window.open(`/partner/applications/${app.id}`, "_blank")}
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <PresignedImage
                          fileKey={app.student_photo_file_key}
                          alt={app.student_name}
                          className="h-10 w-10 rounded-full object-cover"
                          fallback={
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                              {app.student_name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          }
                        />
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
                        <div className="truncate font-medium text-slate-900">{app.student_name}</div>
                        <div className="truncate text-xs text-slate-500">{app.passport_number ?? '—'}</div>
                        {submittedByMember(app) && (
                          <div className="truncate text-xs text-slate-500">By {submittedByMember(app)}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="truncate font-medium text-slate-900">{app.program_name}</div>
                    <div className="truncate text-xs text-slate-500">{app.university_name}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500 truncate">{app.stage}</div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      <AppDate value={app.updated_at} format="relative" />
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

      <TablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        itemCount={paginatedApplications.length}
        totalCount={displayTotal}
        itemLabel="results"
        loading={loading}
      />

      </div>
      </div>
    </div>
  );
};

export default PartnerApplications;
