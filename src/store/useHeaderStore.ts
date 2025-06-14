import { create } from 'zustand';
import { ReactNode } from 'react';

interface HeaderStore {
  centerContent: ReactNode | null;
  setCenterContent: (content: ReactNode | null) => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  centerContent: null,
  setCenterContent: (content) => set({ centerContent: content }),
})); 