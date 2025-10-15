export type DocumentType = 'RESUME' | 'COVER_LETTER' | 'PORTFOLIO' | 'TRANSCRIPT' | 'REFERENCE' | 'OTHER';

export interface Document {
  id: string;
  jobId?: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  content?: string;
  metadata?: {
    matchScore?: number;
    originalResumeId?: string;
    tailoredForJob?: string;
    [key: string]: any;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentData {
  jobId?: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  content?: string;
  metadata?: any;
}
