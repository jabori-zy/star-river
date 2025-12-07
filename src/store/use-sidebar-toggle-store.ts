// Used to determine if sidebar is open, stored in global store
import { create } from "zustand";

// Sidebar open state interface
interface SidebarToggleState {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

// Sidebar toggle store
const useSidebarToggleStore = create<SidebarToggleState>((set) => ({
	isSidebarOpen: true,
	setIsSidebarOpen: (isSidebarOpen) => {
		set({ isSidebarOpen });
	},
}));

export default useSidebarToggleStore;
