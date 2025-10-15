import { z } from 'zod';
import { DocumentType } from '@prisma/client';

export const createDocumentSchema = z.object({
  body: z.object({
    jobId: z.string().optional(),
    documentType: z.nativeEnum(DocumentType),
    title: z.string().min(1, 'Title is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Invalid file URL'),
    fileSize: z.number().positive('File size must be positive'),
    mimeType: z.string().min(1, 'MIME type is required'),
    description: z.string().optional(),
    content: z.string().optional(),
    metadata: z.any().optional(),
  }),
});

export const getDocumentsQuerySchema = z.object({
  query: z.object({
    jobId: z.string().optional(),
    documentType: z.nativeEnum(DocumentType).optional(),
    page: z.string().transform(Number).pipe(z.number().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
  }),
});

export const getDocumentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
});

export const deleteDocumentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    metadata: z.any().optional(),
  }),
});

export const getJobDocumentsSchema = z.object({
  params: z.object({
    jobId: z.string().min(1, 'Job ID is required'),
  }),
});
