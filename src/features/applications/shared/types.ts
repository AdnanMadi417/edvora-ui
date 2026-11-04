import React from 'react';

export interface DocumentRequest {
  id: string;
  type: string[];
}

export interface StatusOption {
  id: string;
  label: string;
  description: string;
  nextAction: string;
  icon: any;
  requiresReason: boolean;
  requiresDocumentSelection: boolean;
}

export interface DocumentRequestListProps {
  documents: DocumentRequest[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRequest[]>>;
  documentTypes: { id: string; label: string; description?: string }[];
}
