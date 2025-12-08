import { create } from "zustand";

interface CustomSysVariableNameState {
	// System variable custom name mapping: key is system variable name (e.g. current_time), value is user-defined display name
	customNames: Record<string, string>;

	// Get list of configured custom names
	getCustomNames: () => Record<string, string>;

	// Get custom name
	getCustomName: (varName: string) => string | undefined;

	// Set custom name
	setCustomName: (varName: string, customName: string) => void;

	// Remove custom name
	removeCustomName: (varName: string) => void;

	// Clear all custom names
	clearAllCustomNames: () => void;
}

export const useCustomSysVariableName = create<CustomSysVariableNameState>(
	(set, get) => ({
		customNames: {},

		getCustomNames: () => {
			return get().customNames;
		},

		getCustomName: (varName: string) => {
			return get().customNames[varName];
		},

		setCustomName: (varName: string, customName: string) => {
			set((state) => ({
				customNames: {
					...state.customNames,
					[varName]: customName,
				},
			}));
		},

		removeCustomName: (varName: string) => {
			set((state) => {
				const { [varName]: _, ...rest } = state.customNames;
				return { customNames: rest };
			});
		},

		clearAllCustomNames: () => {
			set({ customNames: {} });
		},
	}),
);
