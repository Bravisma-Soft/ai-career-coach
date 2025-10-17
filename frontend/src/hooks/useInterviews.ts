import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { useInterviewsStore } from '@/store/interviewsStore';
import { CreateInterviewData, UpdateInterviewData } from '@/types/interview';
import { useToast } from '@/hooks/use-toast';

export const useInterviews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setInterviews } = useInterviewsStore();

  const interviewsQuery = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const data = await interviewService.fetchInterviews();
      setInterviews(data);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewData) =>
      interviewService.createInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Interview scheduled',
        description: 'Your interview has been added successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to schedule interview.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewData }) =>
      interviewService.updateInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Interview updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update interview.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => interviewService.deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: 'Interview deleted',
        description: 'The interview has been removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete interview.',
        variant: 'destructive',
      });
    },
  });

  const prepareInterviewMutation = useMutation({
    mutationFn: (id: string) => interviewService.prepareInterview(id),
    onSuccess: () => {
      // Refetch interviews to get the updated data with preparation info
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  const startMockInterviewMutation = useMutation({
    mutationFn: (interviewId: string) =>
      interviewService.startMockInterview(interviewId),
  });

  const submitMockAnswerMutation = useMutation({
    mutationFn: ({ sessionId, questionId, answer }: { sessionId: string; questionId: string; answer: string }) =>
      interviewService.submitMockAnswer(sessionId, questionId, answer),
  });

  const getMockResultsMutation = useMutation({
    mutationFn: (sessionId: string) =>
      interviewService.getMockResults(sessionId),
  });

  return {
    interviews: interviewsQuery.data ?? [],
    isLoading: interviewsQuery.isLoading,
    error: interviewsQuery.error,
    createInterview: createMutation.mutate,
    updateInterview: updateMutation.mutate,
    deleteInterview: deleteMutation.mutate,
    prepareInterview: prepareInterviewMutation.mutate,
    startMockInterview: startMockInterviewMutation.mutate,
    startMockInterviewAsync: startMockInterviewMutation.mutateAsync,
    submitMockAnswer: submitMockAnswerMutation.mutate,
    getMockResults: getMockResultsMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPreparing: prepareInterviewMutation.isPending,
    isStartingMock: startMockInterviewMutation.isPending,
    preparationData: prepareInterviewMutation.data,
    mockSession: startMockInterviewMutation.data,
    mockResponse: submitMockAnswerMutation.data,
    mockResults: getMockResultsMutation.data,
  };
};
