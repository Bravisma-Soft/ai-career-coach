import { apiClient } from '@/lib/api';
import { Resume, CreateResumeData, UpdateResumeData } from '@/types/resume';

export const resumeService = {
  fetchResumes: async (): Promise<Resume[]> => {
    const response = await apiClient.get<Resume[]>('/resumes');
    return response.data;
  },

  uploadResume: async (data: CreateResumeData): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('type', data.type);

    const response = await apiClient.post<Resume>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  parseResume: async (resumeId: string): Promise<Resume> => {
    const response = await apiClient.post<Resume>(`/resumes/${resumeId}/parse`);
    return response.data;
  },

  updateResume: async (id: string, data: UpdateResumeData): Promise<Resume> => {
    const response = await apiClient.patch<Resume>(`/resumes/${id}`, data);
    return response.data;
  },

  deleteResume: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  },

  downloadResume: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  setMasterResume: async (id: string): Promise<Resume> => {
    const response = await apiClient.patch<Resume>(`/resumes/${id}/set-master`);
    return response.data;
  },
};
