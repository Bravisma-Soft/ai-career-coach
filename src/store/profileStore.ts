import { create } from 'zustand';
import { UserProfile, NotificationSettings, PrivacySettings } from '@/types/profile';

interface ProfileState {
  profile: UserProfile | null;
  notificationSettings: NotificationSettings | null;
  privacySettings: PrivacySettings | null;
  hasUnsavedChanges: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  setPrivacySettings: (settings: PrivacySettings) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  notificationSettings: null,
  privacySettings: null,
  hasUnsavedChanges: false,
  setProfile: (profile) => set({ profile }),
  updateProfile: (data) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...data } : null,
      hasUnsavedChanges: true,
    })),
  setNotificationSettings: (settings) => set({ notificationSettings: settings }),
  setPrivacySettings: (settings) => set({ privacySettings: settings }),
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
}));
