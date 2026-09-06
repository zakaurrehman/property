import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  savedIds: string[];
  compareIds: string[];
  isChatOpen: boolean;
  toggleSaved: (propertyId: string) => void;
  toggleCompare: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  isCompared: (propertyId: string) => boolean;
  clearCompare: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const MAX_COMPARE = 4;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      compareIds: [],
      isChatOpen: false,
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
      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
    }),
    {
      name: "estate-bureau-ui",
      // Chat open/closed is a transient UI state, not something to persist
      // or reopen on the next visit.
      partialize: (state) => ({ savedIds: state.savedIds, compareIds: state.compareIds }),
    },
  ),
);
