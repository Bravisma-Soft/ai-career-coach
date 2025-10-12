import { create } from 'zustand';
import { TailoredResume, CoverLetter, AITask } from '@/types/ai';

interface AIState {
  isProcessing: boolean;
  currentTask: AITask;
  tailoredResume: TailoredResume | null;
  coverLetter: CoverLetter | null;
  error: string | null;
  progress: { message: string; progress: number };
  setProcessing: (task: AITask) => void;
  setTailoredResume: (result: TailoredResume | null) => void;
  setCoverLetter: (result: CoverLetter | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: { message: string; progress: number }) => void;
  reset: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isProcessing: false,
  currentTask: null,
  tailoredResume: null,
  coverLetter: null,
  error: null,
  progress: { message: '', progress: 0 },
  setProcessing: (task) => set({ isProcessing: true, currentTask: task, error: null }),
  setTailoredResume: (result) => set({ tailoredResume: result, isProcessing: false, currentTask: null }),
  setCoverLetter: (result) => set({ coverLetter: result, isProcessing: false, currentTask: null }),
  setError: (error) => set({ error, isProcessing: false, currentTask: null }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({
    isProcessing: false,
    currentTask: null,
    tailoredResume: null,
    coverLetter: null,
    error: null,
    progress: { message: '', progress: 0 }
  }),
}));
