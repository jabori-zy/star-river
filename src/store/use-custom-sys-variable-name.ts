import { create } from "zustand";

interface CustomSysVariableNameState {
	// 系统变量自定义名称映射表: key为系统变量名(如 current_time), value为用户自定义显示名称
	customNames: Record<string, string>;

	//获取已设置的自定义名称列表
	getCustomNames: () => Record<string, string>;

	// 获取自定义名称
	getCustomName: (varName: string) => string | undefined;

	// 设置自定义名称
	setCustomName: (varName: string, customName: string) => void;

	// 删除自定义名称
	removeCustomName: (varName: string) => void;

	// 清空所有自定义名称
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

