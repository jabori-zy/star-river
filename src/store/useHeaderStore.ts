import type { ReactNode } from "react";
import { create } from "zustand";

interface HeaderStore {
	centerContent: ReactNode | null;
	setCenterContent: (content: ReactNode | null) => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
	centerContent: null,
	setCenterContent: (content) => set({ centerContent: content }),
}));
