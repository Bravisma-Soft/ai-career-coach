import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      // Mock data for demo - replace with actual API call
      const mockResumes: Resume[] = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Software Engineer Resume',
          type: 'master',
          isMaster: true,
          version: 1,
          fileUrl: '/mock-resume.pdf',
          fileType: 'application/pdf',
          fileSize: 245000,
          personalInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/johndoe',
            website: 'johndoe.com',
          },
          summary: 'Experienced software engineer with 5+ years of building scalable web applications.',
          experience: [
            {
              id: 'exp-1',
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              location: 'San Francisco, CA',
              startDate: '2020-01',
              endDate: null,
              current: true,
              description: [
                'Led development of microservices architecture',
                'Mentored junior developers',
                'Improved system performance by 40%',
              ],
            },
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'University of California',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              location: 'Berkeley, CA',
              startDate: '2014-09',
              endDate: '2018-05',
              current: false,
              gpa: '3.8',
            },
          ],
          skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      return mockResumes;
      // return resumeService.fetchResumes();
    },
    staleTime: 5 * 60 * 1000,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: CreateResumeData) => {
      // Mock implementation - replace with actual API call
      return new Promise<Resume>((resolve) => {
        setTimeout(() => {
          const newResume: Resume = {
            id: Math.random().toString(36).substr(2, 9),
            userId: 'user-1',
            name: data.name,
            type: data.type,
            isMaster: false,
            version: 1,
            fileUrl: '/mock-resume.pdf',
            fileType: data.file.type,
            fileSize: data.file.size,
            personalInfo: {
              fullName: '',
              email: '',
              phone: '',
              location: '',
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          resolve(newResume);
        }, 1500);
      });
      // return resumeService.uploadResume(data);
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

  return {
    resumes,
    isLoading,
    error,
    uploadResume: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    updateResume: updateMutation.mutate,
    deleteResume: deleteMutation.mutate,
    setMasterResume: setMasterMutation.mutate,
  };
};
