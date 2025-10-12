import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { useJobsStore } from '@/store/jobsStore';
import { CreateJobData, JobStatus, Job } from '@/types/job';
import { toast } from 'sonner';

export const useJobs = () => {
  const queryClient = useQueryClient();
  const { setJobs } = useJobsStore();

  const query = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      // Demo mode - return mock data
      const mockJobs: Job[] = [
        {
          id: '1',
          companyName: 'TechCorp',
          jobTitle: 'Senior Software Engineer',
          description: 'Looking for an experienced software engineer...',
          location: 'San Francisco, CA',
          jobType: 'full-time',
          workMode: 'hybrid',
          status: 'applied',
          matchScore: 95,
          appliedDate: '2025-10-05',
          createdAt: '2025-10-01T10:00:00Z',
          updatedAt: '2025-10-05T10:00:00Z',
        },
        {
          id: '2',
          companyName: 'StartupXYZ',
          jobTitle: 'Product Manager',
          description: 'Join our fast-growing startup...',
          location: 'Remote',
          jobType: 'full-time',
          workMode: 'remote',
          status: 'interview',
          matchScore: 88,
          appliedDate: '2025-10-03',
          createdAt: '2025-10-02T10:00:00Z',
          updatedAt: '2025-10-06T10:00:00Z',
        },
        {
          id: '3',
          companyName: 'InnovateCo',
          jobTitle: 'UX Designer',
          description: 'Creative UX designer needed...',
          location: 'New York, NY',
          jobType: 'full-time',
          workMode: 'onsite',
          status: 'interested',
          matchScore: 75,
          appliedDate: '2025-10-08',
          createdAt: '2025-10-08T10:00:00Z',
          updatedAt: '2025-10-08T10:00:00Z',
        },
      ];
      
      // In production, uncomment:
      // const data = await jobService.fetchJobs();
      setJobs(mockJobs);
      return mockJobs;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateJobData) => {
      // Demo mode - simulate API call
      const newJob = {
        ...data,
        id: crypto.randomUUID(),
        appliedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newJob);
      // In production, uncomment:
      // return jobService.createJob(data);
    },
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      return { previousJobs };
    },
    onSuccess: (newJob) => {
      useJobsStore.getState().addJob(newJob);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job added successfully');
    },
    onError: (error, newJob, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to add job');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) => {
      // Demo mode - simulate API call
      return Promise.resolve({ id, ...data });
      // In production, uncomment:
      // return jobService.updateJob(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      useJobsStore.getState().updateJob(id, data);
      return { previousJobs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error, variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to update job');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      // Demo mode - simulate API call
      return Promise.resolve();
      // In production, uncomment:
      // return jobService.deleteJob(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      useJobsStore.getState().deleteJob(id);
      return { previousJobs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error, id, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to delete job');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => {
      // Demo mode - simulate API call
      return Promise.resolve({ id, status });
      // In production, uncomment:
      // return jobService.updateJobStatus(id, status);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      useJobsStore.getState().updateJobStatus(id, status);
      return { previousJobs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error, variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to update job status');
    },
  });

  return {
    jobs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createJob: createMutation.mutate,
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    updateJobStatus: updateStatusMutation.mutate,
  };
};
