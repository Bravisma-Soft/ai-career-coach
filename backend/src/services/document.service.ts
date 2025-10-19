import { prisma } from '@/database/client';
import { DocumentType } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';

export interface CreateDocumentData {
  jobId?: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  content?: string; // For text-based documents like tailored resumes
  metadata?: any;
}

export interface GetDocumentsQuery {
  jobId?: string;
  documentType?: DocumentType;
  page?: number;
  limit?: number;
}

class DocumentService {
  /**
   * Create a new document
   */
  async createDocument(data: CreateDocumentData) {
    try {
      const document = await prisma.document.create({
        data: {
          jobId: data.jobId,
          documentType: data.documentType,
          title: data.title,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          description: data.description,
          content: data.content,
          metadata: data.metadata,
        },
      });

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new ApiError(500, 'Failed to create document');
    }
  }

  /**
   * Get documents with optional filters
   */
  async getDocuments(query: GetDocumentsQuery) {
    const { jobId, documentType, page = 1, limit = 20 } = query;

    try {
      const skip = (page - 1) * limit;

      const where: any = {};
      if (jobId) where.jobId = jobId;
      if (documentType) where.documentType = documentType;

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new ApiError(500, 'Failed to fetch documents');
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          job: {
            select: {
              id: true,
              company: true,
              title: true,
            },
          },
        },
      });

      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error fetching document:', error);
      throw new ApiError(500, 'Failed to fetch document');
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      await prisma.document.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error deleting document:', error);
      throw new ApiError(500, 'Failed to delete document');
    }
  }

  /**
   * Get documents for a specific job
   */
  async getJobDocuments(jobId: string) {
    try {
      const documents = await prisma.document.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' },
      });

      return documents;
    } catch (error) {
      console.error('Error fetching job documents:', error);
      throw new ApiError(500, 'Failed to fetch job documents');
    }
  }

  /**
   * Update document
   */
  async updateDocument(id: string, data: Partial<CreateDocumentData>) {
    try {
      const document = await prisma.document.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          metadata: data.metadata,
        },
      });

      return document;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new ApiError(500, 'Failed to update document');
    }
  }
}

export const documentService = new DocumentService();
