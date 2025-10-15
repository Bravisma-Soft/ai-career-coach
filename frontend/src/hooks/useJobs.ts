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
      const data = await jobService.fetchJobs();
      setJobs(data);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateJobData) => {
      return jobService.createJob(data);
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
      return jobService.updateJob(id, data as Partial<Job>);
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
      return jobService.deleteJob(id);
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
      return jobService.updateJobStatus(id, status);
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
