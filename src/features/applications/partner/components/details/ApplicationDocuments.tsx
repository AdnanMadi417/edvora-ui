'use client';

import React, { useState } from 'react';
import { FolderOpen, ChevronDown } from 'lucide-react';
import EmptyData from 'components/emptyData/EmptyData';
import DocumentActions from 'features/applications/shared/DocumentActions';
import { AppDate } from "components/ui/date";
import { SectionIconBadge } from "components/ui/icons";
import { SolidBadge } from "components/ui/badges";
import { DOCUMENT_STATUS_ICON, DOCUMENT_STATUS_BADGE, DOCUMENT_STATUS_LABEL } from "features/applications/shared/documentStatus";

interface ApplicationDocumentsProps {
  application: any;
  onRefetch?: () => void;
}

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
    const icon = DOCUMENT_STATUS_ICON[doc.status] ?? DOCUMENT_STATUS_ICON['1'];
    const badge = DOCUMENT_STATUS_BADGE[doc.status] ?? DOCUMENT_STATUS_BADGE['1'];
    const label = DOCUMENT_STATUS_LABEL[doc.status] ?? 'Pending';

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
              <SolidBadge variant="warning" className="absolute -right-1 -top-1 h-5 w-5 rounded-md text-[10px]">
                {pendingDocuments}
              </SolidBadge>
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
