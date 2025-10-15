import { apiClient } from '@/lib/api';
import { Document, CreateDocumentData } from '@/types/document';

export const documentService = {
  /**
   * Create a new document
   */
  async createDocument(data: CreateDocumentData): Promise<Document> {
    const response = await apiClient.post('/documents', data);
    return response.data.data.document;
  },

  /**
   * Get all documents with optional filtering
   */
  async getDocuments(params?: {
    jobId?: string;
    documentType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ documents: Document[]; total: number }> {
    const response = await apiClient.get('/documents', { params });
    return {
      documents: response.data.data,
      total: response.data.pagination?.total || response.data.data.length,
    };
  },

  /**
   * Get documents for a specific job
   */
  async getJobDocuments(jobId: string): Promise<Document[]> {
    const response = await apiClient.get(`/documents/job/${jobId}`);
    return response.data.data.documents;
  },

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<Document> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.data.document;
  },

  /**
   * Update a document
   */
  async updateDocument(
    id: string,
    data: Partial<Pick<CreateDocumentData, 'title' | 'description' | 'content' | 'metadata'>>
  ): Promise<Document> {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data.data.document;
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};
