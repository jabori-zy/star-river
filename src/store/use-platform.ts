import { create } from "zustand";

interface PlatformState {
	isWindows: boolean;
	isMac: boolean;
	isLinux: boolean;
	isFullScreen: boolean;
	platform: string;
	setIsFullScreen: (isFullScreen: boolean) => void;
}

// 获取 ipcRenderer
const getIpcRenderer = () => {
	if (typeof window !== "undefined" && window.require) {
		try {
			return window.require("electron").ipcRenderer;
		} catch {
			return null;
		}
	}
	return null;
};

export const usePlatform = create<PlatformState>((set) => {
	const platform =
		typeof process !== "undefined" ? process.platform : "unknown";

	// 监听全屏状态变化
	const ipcRenderer = getIpcRenderer();
	if (ipcRenderer) {
		ipcRenderer.on("fullscreen-change", (_: unknown, isFullScreen: boolean) => {
			set({ isFullScreen });
		});
	}

	return {
		isWindows: platform === "win32",
		isMac: platform === "darwin",
		isLinux: platform === "linux",
		isFullScreen: false,
		platform,
		setIsFullScreen: (isFullScreen: boolean) => set({ isFullScreen }),
	};
});
