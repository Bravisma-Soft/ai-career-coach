import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { resumeService } from '@/services/resumeService';
import { useResumesStore } from '@/store/resumesStore';
import { Resume, CreateResumeData, UpdateResumeData } from '@/types/resume';
import { toast } from '@/hooks/use-toast';

export const useResumes = () => {
  const queryClient = useQueryClient();
  const { setResumes, addResume, updateResume, deleteResume, setMasterResume } = useResumesStore();

  const { data: resumes = [], isLoading, error } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      // Real API call
      return resumeService.fetchResumes();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sync resumes with store whenever they change
  useEffect(() => {
    if (resumes.length > 0) {
      setResumes(resumes);
    }
  }, [resumes, setResumes]);

  const uploadMutation = useMutation({
    mutationFn: (data: CreateResumeData) => {
      // Real API call
      return resumeService.uploadResume(data);
    },
    onSuccess: (newResume) => {
      queryClient.setQueryData<Resume[]>(['resumes'], (old = []) => [...old, newResume]);
      addResume(newResume);
      toast({
        title: 'Resume uploaded',
        description: 'Your resume has been uploaded successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeData }) => resumeService.updateResume(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      const previousResumes = queryClient.getQueryData<Resume[]>(['resumes']);
      queryClient.setQueryData<Resume[]>(['resumes'], (old = []) =>
        old.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
      );
      return { previousResumes };
    },
    onSuccess: (_, { id, data }) => {
      updateResume(id, data);
      toast({
        title: 'Resume updated',
        description: 'Your resume has been updated successfully.',
      });
    },
    onError: (_, __, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
      toast({
        title: 'Update failed',
        description: 'Failed to update resume. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      const previousResumes = queryClient.getQueryData<Resume[]>(['resumes']);
      queryClient.setQueryData<Resume[]>(['resumes'], (old = []) => old.filter((r) => r.id !== id));
      return { previousResumes };
    },
    onSuccess: (_, id) => {
      deleteResume(id);
      toast({
        title: 'Resume deleted',
        description: 'Your resume has been deleted successfully.',
      });
    },
    onError: (_, __, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
      toast({
        title: 'Delete failed',
        description: 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const setMasterMutation = useMutation({
    mutationFn: (id: string) => resumeService.setMasterResume(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Resume[]>(['resumes'], (old = []) =>
        old.map((r) => ({ ...r, isMaster: r.id === id }))
      );
      setMasterResume(id);
      toast({
        title: 'Master resume set',
        description: 'This resume has been set as your master resume.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to set master',
        description: 'Failed to set master resume. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const parseMutation = useMutation({
    mutationFn: (id: string) => resumeService.parseResume(id),
    onSuccess: (updatedResume) => {
      queryClient.setQueryData<Resume[]>(['resumes'], (old = []) =>
        old.map((r) => (r.id === updatedResume.id ? updatedResume : r))
      );
      toast({
        title: 'Resume parsing started',
        description: 'Your resume is being parsed. This may take a few moments.',
      });

      // Poll for updates every 5 seconds for up to 2 minutes
      let pollCount = 0;
      const maxPolls = 24; // 2 minutes / 5 seconds
      const pollInterval = setInterval(async () => {
        pollCount++;

        try {
          // Refetch the resumes to get the updated parsed data
          const result = await queryClient.fetchQuery({ queryKey: ['resumes'] });
          const targetResume = result?.find((r: Resume) => r.id === updatedResume.id);

          // Check if parsing is complete - either has parsed data or has an error
          const hasData = targetResume?.personalInfo || targetResume?.experience || targetResume?.education;
          const hasError = targetResume?.parsedData && typeof targetResume.parsedData === 'object' && 'error' in targetResume.parsedData;

          if (hasData) {
            // Parsing complete successfully
            clearInterval(pollInterval);
            toast({
              title: 'Resume parsed successfully',
              description: 'Your resume has been analyzed and is ready to use.',
            });
          } else if (hasError) {
            // Parsing failed
            clearInterval(pollInterval);
            toast({
              title: 'Parsing failed',
              description: 'There was an error parsing your resume. Please try again.',
              variant: 'destructive',
            });
          } else if (pollCount >= maxPolls) {
            // Timeout
            clearInterval(pollInterval);
            toast({
              title: 'Parsing is taking longer than expected',
              description: 'Please refresh the page to check the status.',
              variant: 'default',
            });
          }
        } catch (error) {
          console.error('Error polling resume status:', error);
          // Stop polling on error
          clearInterval(pollInterval);
        }
      }, 5000);
    },
    onError: () => {
      toast({
        title: 'Parse failed',
        description: 'Failed to start parsing. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    resumes,
    isLoading,
    error,
    uploadResume: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    updateResume: updateMutation.mutate,
    deleteResume: deleteMutation.mutate,
    setMasterResume: setMasterMutation.mutate,
    parseResume: parseMutation.mutate,
    isParsing: parseMutation.isPending,
  };
};
