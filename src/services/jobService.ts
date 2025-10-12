import { apiClient } from '@/lib/api';
import { Job, CreateJobData, JobStatus } from '@/types/job';

export const jobService = {
  fetchJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>('/jobs');
    return response.data;
  },

  createJob: async (data: CreateJobData): Promise<Job> => {
    const response = await apiClient.post<Job>('/jobs', data);
    return response.data;
  },

  updateJob: async (id: string, data: Partial<Job>): Promise<Job> => {
    const response = await apiClient.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  updateJobStatus: async (id: string, status: JobStatus): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/status`, { status });
    return response.data;
  },
};
