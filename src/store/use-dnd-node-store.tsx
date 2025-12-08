import { create } from "zustand";
import type { NodeItemProps } from "@/types/nodeCategory";

interface DragAndDropState {
	dragNodeItem: NodeItemProps | null;
	setDragNodeItem: (nodeItem: NodeItemProps | null) => void;
}

export const useDndNodeStore = create<DragAndDropState>((set) => ({
	dragNodeItem: null,
	setDragNodeItem: (nodeItem) => set({ dragNodeItem: nodeItem }),
}));
