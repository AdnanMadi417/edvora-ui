'use client';

import React, { useState } from 'react';
import { FolderOpen, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import EmptyData from 'components/emptyData/EmptyData';
import DocumentActions from 'features/applications/shared/DocumentActions';
import { AppDate } from "components/ui/date";
import { SectionIconBadge } from "components/ui/icons";

interface ApplicationDocumentsProps {
  application: any;
  onRefetch?: () => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  '1': <Clock className="h-5 w-5 text-yellow-500" />,
  '2': <CheckCircle className="h-5 w-5 text-green-600" />,
  '3': <XCircle className="h-5 w-5 text-red-600" />,
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  approved: <CheckCircle className="h-5 w-5 text-green-600" />,
  rejected: <XCircle className="h-5 w-5 text-red-600" />,
};

const STATUS_BADGE: Record<string, string> = {
  '1': 'border-yellow-200 bg-yellow-50 text-yellow-700',
  '2': 'border-green-200 bg-green-50 text-green-700',
  '3': 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  approved: 'border-green-200 bg-green-50 text-green-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  '1': 'Pending',
  '2': 'Approved',
  '3': 'Rejected',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function ApplicationDocuments({ application, onRefetch }: ApplicationDocumentsProps) {
  const [showDocs, setShowDocs] = useState(false);
  const studentName = application?.student?.name;

  const allDocs: any[] = application?.documents || [];
  const documents = allDocs;
  const paymentDocuments: any[] = application?.payment_documents || [];
  const arrivalDocuments: any[] = application?.arrival_documents || [];
  const emgsEvalDoc: any = application?.emgs_evaluation_document || null;
  const offerLetterDoc: any = application?.offer_letter_document || null;
  const visaDoc: any = application?.visa_document || null;
  const commissionDocuments: any[] = Object.values(application?.commission_documents || {}).filter(Boolean) as any[];
  const singleDocs = [emgsEvalDoc, offerLetterDoc, visaDoc].filter(Boolean);
  const totalDocuments = documents.length + paymentDocuments.length + arrivalDocuments.length + singleDocs.length + commissionDocuments.length;
  const pendingDocuments = [...documents, ...paymentDocuments, ...arrivalDocuments, ...[emgsEvalDoc, visaDoc].filter(Boolean), ...commissionDocuments].filter(
    (d) => d.status === '1' || d.status === 'pending',
  ).length;

  if (totalDocuments === 0) return <EmptyData />;

  const DocRow = ({ doc }: { doc: any }) => {
    const icon = STATUS_ICON[doc.status] ?? STATUS_ICON['1'];
    const badge = STATUS_BADGE[doc.status] ?? STATUS_BADGE['1'];
    const label = STATUS_LABEL[doc.status] ?? 'Pending';

    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 p-5 transition-colors hover:bg-slate-50">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary">
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
            <p className="mt-0.5 text-xs text-slate-400"><AppDate value={doc.created_at} format="short" fallback="Not provided" /></p>
            {doc.approve_notes && (
              <p className="mt-2.5 text-xs text-slate-500">
                Note: <span className="font-medium text-slate-700">{doc.approve_notes}</span>
              </p>
            )}
          </div>
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-2">
          <DocumentActions fileKey={doc.file_key} label={doc.document_type || 'Document'} personName={studentName} />
        </div>
      </div>
    );
  };

  const DocGroup = ({ label, docs }: { label: string; docs: any[] }) => {
    if (docs.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="space-y-4">
          {docs.map((doc: any) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="group flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-slate-50/80"
        onClick={() => setShowDocs(!showDocs)}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <SectionIconBadge icon={FolderOpen} color="blue" />
            {pendingDocuments > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 text-[10px] font-bold text-white">
                {pendingDocuments}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-p3 font-semibold text-slate-900">Application Documents</h3>
            <p className="text-sm text-slate-500">
              {totalDocuments} {totalDocuments === 1 ? 'file' : 'files'}
              {pendingDocuments > 0 && (
                <span className="font-medium text-amber-600"> · {pendingDocuments} pending review</span>
              )}
            </p>
          </div>
        </div>

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
        <div className="space-y-4 border-t border-slate-200 p-6">
          {allDocs.map((doc: any) => <DocRow key={doc.id} doc={doc} />)}
          <DocGroup label="Payment Documents" docs={paymentDocuments} />
          <DocGroup label="Arrival Documents" docs={arrivalDocuments} />
          <DocGroup label="Offer Letter" docs={offerLetterDoc ? [offerLetterDoc] : []} />
          <DocGroup label="EMGS Eval Document" docs={emgsEvalDoc ? [emgsEvalDoc] : []} />
          <DocGroup label="Visa Document" docs={visaDoc ? [visaDoc] : []} />
          <DocGroup label="Commission Documents" docs={commissionDocuments} />
        </div>
      )}
    </>
  );
}
