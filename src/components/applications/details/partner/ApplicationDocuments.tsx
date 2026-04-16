'use client';

import React, { useState } from 'react';
import { FolderOpen, ChevronDown, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import EmptyData from 'components/emptyData/EmptyData';
import { getDocumentDownloadUrl } from 'services/documentService';
import { useToast } from '../../../context/ToastContext';

interface ApplicationDocumentsProps {
  application: any;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  '1': <Clock className="h-5 w-5 text-yellow-500" />,
  '2': <CheckCircle className="h-5 w-5 text-green-600" />,
  '3': <XCircle className="h-5 w-5 text-red-600" />,
};

const STATUS_BADGE: Record<string, string> = {
  '1': 'border-yellow-200 bg-yellow-50 text-yellow-700',
  '2': 'border-green-200 bg-green-50 text-green-700',
  '3': 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  '1': 'Pending',
  '2': 'Approved',
  '3': 'Rejected',
};

export default function ApplicationDocuments({ application }: ApplicationDocumentsProps) {
  const [showDocs, setShowDocs] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { showToast } = useToast();

  const documents: any[] = application?.documents || [];
  const paymentDocuments: any[] = application?.payment_documents || [];
  const arrivalDocuments: any[] = application?.arrival_documents || [];
  const emgsEvalDoc: any = application?.emgs_evaluation_document || null;
  const commissionDocuments: any[] = Object.values(application?.commission_documents || {}).filter(Boolean) as any[];
  const totalDocuments = documents.length + paymentDocuments.length + arrivalDocuments.length + (emgsEvalDoc ? 1 : 0) + commissionDocuments.length;
  const pendingDocuments = [...documents, ...paymentDocuments, ...arrivalDocuments, ...(emgsEvalDoc ? [emgsEvalDoc] : []), ...commissionDocuments].filter(
    (d) => d.status === '1',
  ).length;

  const handleDownload = async (fileKey: string, docId: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(docId);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, '_blank');
    } catch (err: any) {
      showToast(err?.message || 'Failed to download document', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  if (totalDocuments === 0) return <EmptyData />;

  const DocRow = ({ doc }: { doc: any }) => {
    const icon = STATUS_ICON[doc.status] ?? STATUS_ICON['1'];
    const badge = STATUS_BADGE[doc.status] ?? STATUS_BADGE['1'];
    const label = STATUS_LABEL[doc.status] ?? 'Pending';
    const isDownloading = downloading === doc.id;

    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-slate-50">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">
                {doc.document_type
                  ? doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)
                  : 'Document'}
              </p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                {label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{formatDate(doc.created_at)}</p>
            {doc.approve_notes && (
              <p className="mt-1 text-xs text-slate-500">
                Note: <span className="font-medium text-slate-700">{doc.approve_notes}</span>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => doc.file_key && handleDownload(doc.file_key, doc.id)}
          disabled={!doc.file_key || !!downloading}
          className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent bg-green-50 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Download"
        >
          <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    );
  };

  const DocGroup = ({ label, docs }: { label: string; docs: any[] }) => {
    if (docs.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="space-y-2">
          {docs.map((doc: any) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="mb-6 mt-6 max-w-5xl mx-auto rounded-lg bg-card">
      <div
        className={`group flex cursor-pointer items-center justify-between border border-gray-200 p-4 sm:p-5 transition-all duration-200 hover:bg-slate-50/80 ${
          showDocs ? 'rounded-t-lg' : 'rounded-lg'
        }`}
        onClick={() => setShowDocs(!showDocs)}
      >
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            {pendingDocuments > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingDocuments}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Application Documents</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {totalDocuments} {totalDocuments === 1 ? 'file' : 'files'}
              {pendingDocuments > 0 && (
                <span className="font-medium text-amber-600"> · {pendingDocuments} pending review</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: badges + chevron */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {totalDocuments} Total
            </span>
            {pendingDocuments > 0 && (
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                {pendingDocuments} Pending
              </span>
            )}
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              showDocs ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
            } group-hover:bg-blue-50 group-hover:text-blue-600`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDocs ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {showDocs && (
        <div className="space-y-6 rounded-b-lg border border-t-0 border-gray-200 bg-card p-6">
          <DocGroup label="Application Documents" docs={documents} />
          <DocGroup label="Payment Documents" docs={paymentDocuments} />
          <DocGroup label="Arrival Documents" docs={arrivalDocuments} />
          <DocGroup label="EMGS Eval Document" docs={emgsEvalDoc ? [emgsEvalDoc] : []} />
          <DocGroup label="Commission Documents" docs={commissionDocuments} />
        </div>
      )}
    </section>
  );
}
