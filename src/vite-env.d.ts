/// <reference types="vite/client" />

// Declare window.require type for Electron environment
declare global {
	interface Window {
		require?: (module: string) => {
			ipcRenderer?: {
				invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
			};
		};
	}
}
