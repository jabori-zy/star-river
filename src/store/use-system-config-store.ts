import { create } from "zustand";
import { changeLanguage } from "@/i18n/i18n";
import { getSystemConfig, updateSystemConfig } from "@/service/system";
import type { SupportLanguage, SystemConfig } from "@/types/system";

// System config state interface
interface SystemConfigState {
	systemConfig: SystemConfig | null;
	isLoading: boolean;
	isInitialized: boolean;

	// Action methods
	loadSystemConfig: () => Promise<void>;
	updateSystemConfigAction: (config: SystemConfig) => Promise<void>;
	setLanguage: (language: SupportLanguage) => Promise<void>;
}

// System config store
const useSystemConfigStore = create<SystemConfigState>((set, get) => ({
	systemConfig: null,
	isLoading: false,
	isInitialized: false,

	// Load system config
	loadSystemConfig: async () => {
		const { isLoading } = get();
		if (isLoading) return; // Prevent duplicate requests

		set({ isLoading: true });
		try {
			const config = await getSystemConfig();
			set({
				systemConfig: config,
				isLoading: false,
				isInitialized: true,
			});

			// Auto set language
			if (config.localization) {
				changeLanguage(config.localization);
			}

			// console.log("System config loaded successfully:", config);
		} catch (error) {
			console.error("Failed to load system config:", error);
			set({
				isLoading: false,
				isInitialized: true,
			});
		}
	},

	// Update system config
	updateSystemConfigAction: async (config: SystemConfig) => {
		set({ isLoading: true });
		try {
			const updatedConfig = await updateSystemConfig(config);
			set({
				systemConfig: updatedConfig,
				isLoading: false,
			});

			// Switch language
			if (updatedConfig.localization) {
				changeLanguage(updatedConfig.localization);
			}

			console.log("System config updated successfully:", updatedConfig);
		} catch (error) {
			console.error("Failed to update system config:", error);
			set({ isLoading: false });
			throw error;
		}
	},

	// Set language (only switch i18n language, don't update database)
	setLanguage: async (language: SupportLanguage) => {
		try {
			await changeLanguage(language);
			console.log("Language switched successfully:", language);
		} catch (error) {
			console.error("Failed to switch language:", error);
			throw error;
		}
	},
}));

export default useSystemConfigStore;
