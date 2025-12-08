import { create } from "zustand";

interface PlatformState {
	isWindows: boolean;
	isMac: boolean;
	isLinux: boolean;
	platform: string;
}

export const usePlatform = create<PlatformState>(() => {
	const platform =
		typeof process !== "undefined" ? process.platform : "unknown";

	return {
		isWindows: platform === "win32",
		isMac: platform === "darwin",
		isLinux: platform === "linux",
		platform,
	};
});
