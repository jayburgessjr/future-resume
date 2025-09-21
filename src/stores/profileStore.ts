import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileData {
  displayName: string;
  jobTitle: string;
  northStar: string;
  headline: string;
}

interface ProfileStore extends ProfileData {
  updateProfile: (updates: Partial<ProfileData>) => void;
  resetProfile: () => void;
}

const initialState: ProfileData = {
  displayName: "",
  jobTitle: "",
  northStar: "",
  headline: "",
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      ...initialState,
      updateProfile: (updates) =>
        set((state) => ({
          ...state,
          ...updates,
        })),
      resetProfile: () => set(initialState),
    }),
    {
      name: "profile-preferences",
      partialize: ({ displayName, jobTitle, northStar, headline }) => ({
        displayName,
        jobTitle,
        northStar,
        headline,
      }),
    }
  )
);
