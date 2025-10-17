import { apiClient } from '@/lib/api';
import { Job, CreateJobData, JobStatus } from '@/types/job';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const jobService = {
  parseJobUrl: async (url: string): Promise<{
    company: string;
    title: string;
    jobDescription: string;
    location: string;
    salaryRange?: string | null;
    jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
    workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        jobData: {
          company: string;
          title: string;
          jobDescription: string;
          location: string;
          salaryRange?: string | null;
          jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
          workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
        };
      };
    }>('/jobs/parse-url', { url });
    return response.data.data.jobData;
  },

  fetchJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<PaginatedResponse<Job>>('/jobs');
    return response.data.data; // Extract data array from paginated response
  },

  createJob: async (data: CreateJobData): Promise<Job> => {
    // Map frontend field names to backend field names
    const backendData: any = {
      ...data,
      description: data.jobDescription,
      url: data.jobUrl,
      deadline: data.applicationDeadline,
    };

    // Remove frontend-specific fields
    delete backendData.jobDescription;
    delete backendData.jobUrl;
    delete backendData.applicationDeadline;
    delete backendData.salaryRange; // Backend doesn't have this field yet

    const response = await apiClient.post<{ success: boolean; data: { job: Job } }>('/jobs', backendData);
    return response.data.data.job;
  },

  updateJob: async (id: string, data: Partial<Job>): Promise<Job> => {
    // Map frontend field names to backend field names
    const backendData: any = {};

    // Only include fields that are actually in the data object
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];

      // Skip undefined, null
      if (value === undefined || value === null) {
        return;
      }

      // Skip empty strings for required fields (they have min length validation)
      if (value === '' && ['title', 'company'].includes(key)) {
        return;
      }

      // Map field names
      if (key === 'jobDescription') {
        backendData.description = value;
      } else if (key === 'jobUrl') {
        backendData.url = value || ''; // Allow empty string for URLs
      } else if (key === 'appliedAt') {
        // Ensure date is in ISO string format
        backendData.appliedAt = value instanceof Date ? value.toISOString() : value;
      } else if (key === 'applicationDeadline') {
        // Ensure date is in ISO string format
        backendData.deadline = value instanceof Date ? value.toISOString() : value;
      } else if (key === 'salaryRange') {
        // Skip - not in backend
      } else if (['matchScore', 'createdAt', 'updatedAt', 'id'].includes(key)) {
        // Skip read-only fields
      } else {
        // Include all other fields as-is
        backendData[key] = value;
      }
    });

    const response = await apiClient.put<{ success: boolean; data: { job: Job } }>(`/jobs/${id}`, backendData);
    return response.data.data.job;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  updateJobStatus: async (id: string, status: JobStatus): Promise<Job> => {
    const response = await apiClient.put<{ success: boolean; data: { job: Job } }>(`/jobs/${id}/status`, { status });
    return response.data.data.job;
  },
};
