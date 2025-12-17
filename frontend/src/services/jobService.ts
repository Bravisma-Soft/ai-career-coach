import { apiClient } from '@/lib/api';
import { Job, CreateJobData, JobStatus } from '@/types/job';

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  company?: string;
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  priority?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'company' | 'title' | 'priority' | 'postedDate';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

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

export interface JobsResponse {
  jobs: Job[];
  pagination: PaginatedResponse<Job>['pagination'];
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

  fetchJobs: async (params: JobsQueryParams = {}): Promise<JobsResponse> => {
    // Default to a high limit to get all jobs unless pagination is explicitly requested
    const queryParams = {
      limit: params.limit ?? 100,
      ...params,
    };

    // Build query string, filtering out undefined values
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const response = await apiClient.get<PaginatedResponse<Job>>(`/jobs${queryString ? `?${queryString}` : ''}`);
    return {
      jobs: response.data.data,
      pagination: response.data.pagination,
    };
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
