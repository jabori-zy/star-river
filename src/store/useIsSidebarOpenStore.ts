// 用于判断侧边栏是否打开, 存储在全局store中
import { create } from 'zustand';

// 侧边栏是否打开的state
interface IsSidebarOpenState {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

// 侧边栏是否打开的store
const useIsSidebarOpenStore = create<IsSidebarOpenState>((set) => ({
    isSidebarOpen: true,
    setIsSidebarOpen: (isSidebarOpen) => {
        set({ isSidebarOpen })
        console.log("isSidebarOpen", isSidebarOpen)
    },
}))

export default useIsSidebarOpenStore;