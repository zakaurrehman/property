import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  savedIds: string[];
  compareIds: string[];
  toggleSaved: (propertyId: string) => void;
  toggleCompare: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  isCompared: (propertyId: string) => boolean;
  clearCompare: () => void;
}

const MAX_COMPARE = 4;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      compareIds: [],
      toggleSaved: (propertyId) =>
        set((state) => ({
          savedIds: state.savedIds.includes(propertyId)
            ? state.savedIds.filter((id) => id !== propertyId)
            : [...state.savedIds, propertyId],
        })),
      toggleCompare: (propertyId) =>
        set((state) => {
          if (state.compareIds.includes(propertyId)) {
            return { compareIds: state.compareIds.filter((id) => id !== propertyId) };
          }
          if (state.compareIds.length >= MAX_COMPARE) return state;
          return { compareIds: [...state.compareIds, propertyId] };
        }),
      isSaved: (propertyId) => get().savedIds.includes(propertyId),
      isCompared: (propertyId) => get().compareIds.includes(propertyId),
      clearCompare: () => set({ compareIds: [] }),
    }),
    { name: "estate-bureau-ui" },
  ),
);
