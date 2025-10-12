import { create } from 'zustand';
import { Interview, MockInterviewSession } from '@/types/interview';

interface InterviewsState {
  interviews: Interview[];
  selectedInterview: Interview | null;
  mockSession: MockInterviewSession | null;
  
  setInterviews: (interviews: Interview[]) => void;
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, data: Partial<Interview>) => void;
  deleteInterview: (id: string) => void;
  setSelectedInterview: (interview: Interview | null) => void;
  
  setMockSession: (session: MockInterviewSession | null) => void;
  updateMockSession: (data: Partial<MockInterviewSession>) => void;
}

export const useInterviewsStore = create<InterviewsState>((set) => ({
  interviews: [],
  selectedInterview: null,
  mockSession: null,
  
  setInterviews: (interviews) => set({ interviews }),
  
  addInterview: (interview) =>
    set((state) => ({
      interviews: [...state.interviews, interview],
    })),
  
  updateInterview: (id, data) =>
    set((state) => ({
      interviews: state.interviews.map((interview) =>
        interview.id === id ? { ...interview, ...data } : interview
      ),
      selectedInterview:
        state.selectedInterview?.id === id
          ? { ...state.selectedInterview, ...data }
          : state.selectedInterview,
    })),
  
  deleteInterview: (id) =>
    set((state) => ({
      interviews: state.interviews.filter((interview) => interview.id !== id),
      selectedInterview:
        state.selectedInterview?.id === id ? null : state.selectedInterview,
    })),
  
  setSelectedInterview: (interview) =>
    set({ selectedInterview: interview }),
  
  setMockSession: (session) =>
    set({ mockSession: session }),
  
  updateMockSession: (data) =>
    set((state) => ({
      mockSession: state.mockSession
        ? { ...state.mockSession, ...data }
        : null,
    })),
}));
