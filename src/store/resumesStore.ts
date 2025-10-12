import { create } from 'zustand';
import { Resume } from '@/types/resume';

interface ResumesState {
  resumes: Resume[];
  masterResume: Resume | null;
  selectedResume: Resume | null;
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, data: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  setSelectedResume: (resume: Resume | null) => void;
  setMasterResume: (resumeId: string) => void;
}

export const useResumesStore = create<ResumesState>((set) => ({
  resumes: [],
  masterResume: null,
  selectedResume: null,
  setResumes: (resumes) => {
    const master = resumes.find((r) => r.isMaster) || null;
    set({ resumes, masterResume: master });
  },
  addResume: (resume) =>
    set((state) => {
      const newResumes = [...state.resumes, resume];
      const master = resume.isMaster ? resume : state.masterResume;
      return { resumes: newResumes, masterResume: master };
    }),
  updateResume: (id, data) =>
    set((state) => {
      const updatedResumes = state.resumes.map((r) =>
        r.id === id ? { ...r, ...data } : r
      );
      const master = data.isMaster
        ? updatedResumes.find((r) => r.id === id) || state.masterResume
        : state.masterResume;
      return { resumes: updatedResumes, masterResume: master };
    }),
  deleteResume: (id) =>
    set((state) => {
      const filteredResumes = state.resumes.filter((r) => r.id !== id);
      const master = state.masterResume?.id === id ? null : state.masterResume;
      return { resumes: filteredResumes, masterResume: master };
    }),
  setSelectedResume: (resume) => set({ selectedResume: resume }),
  setMasterResume: (resumeId) =>
    set((state) => {
      const updatedResumes = state.resumes.map((r) => ({
        ...r,
        isMaster: r.id === resumeId,
      }));
      const master = updatedResumes.find((r) => r.id === resumeId) || null;
      return { resumes: updatedResumes, masterResume: master };
    }),
}));
