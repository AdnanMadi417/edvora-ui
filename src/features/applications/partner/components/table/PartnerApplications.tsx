'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import PipelineCard from 'features/applications/partner/components/PipelineCard';

import { useRouter } from 'next/navigation';
import api from 'lib/useApi';
import { useMe } from 'hooks/useMe';

import Button from 'components/ub/core/Button';
import ApplicationFilterBar from 'components/ub/navigation/ApplicationFilterBar';
import ApplicationsTable from 'features/applications/components/ApplicationsTable';
import TablePagination from 'components/ub/data/TablePagination';
import { getAsyncStatus } from 'components/ub/feedback/AsyncStatus';

import { useUniversities } from "features/universities/hooks";
import { useAllStages, useAllStageStatuses } from "features/applications/hooks";
import { usePartnerApplications } from "features/applications/partner/hooks/usePartnerApplications";


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

  // Display name for a status code, from the stage-status list.
  const statusLabel = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, "_") ?? "";
    const match = stageStatuses.find((s) => s.name.toLowerCase().replace(/\s+/g, "_") === normalized);
    return match?.name ?? (normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown");
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
    <div className="mt-6 max-w-ub-dashboard mx-auto text-p2 bg-white rounded-lg border border-slate-200">

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

      <div className="border-t border-ub-border p-6">
        <ApplicationsTable
          rows={paginatedApplications}
          loading={loading}
          error={error}
          onRetry={refetch}
          hrefFor={(id) => `/partner/applications/${id}`}
          ownership="advisor"
          statusLabel={statusLabel}
          needsAction={needsPartnerAction}
          defaultDensity="comfortable"
          selectable={false}
          selectionResetKey={[selectedLifecycle, selectedStages, selectedStageStatus, selectedUniversity, debouncedSearch, currentPage].join("|")}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              itemCount={paginatedApplications.length}
              totalCount={displayTotal}
              itemLabel="results"
              loading={loading}
            />
          }
        />
      </div>
    </div>
  );
};

export default PartnerApplications;
