import { create } from "zustand";

export interface NavigationGuard {
	id: string;
	hasUnsavedChanges: boolean;
	title?: string;
	description?: string;
	onSave?: () => Promise<void> | void;
}

interface NavigationGuardState {
	guards: Record<string, NavigationGuard>;
	registerGuard: (guard: NavigationGuard) => void;
	unregisterGuard: (id: string) => void;
	updateGuard: (id: string, hasUnsavedChanges: boolean) => void;
	getActiveGuard: () => NavigationGuard | null;
}

export const useNavigationGuardStore = create<NavigationGuardState>(
	(set, get) => ({
		guards: {},

		registerGuard: (guard) =>
			set((state) => ({
				guards: { ...state.guards, [guard.id]: guard },
			})),

		unregisterGuard: (id) =>
			set((state) => {
				const { [id]: _, ...rest } = state.guards;
				return { guards: rest };
			}),

		updateGuard: (id, hasUnsavedChanges) =>
			set((state) => {
				const guard = state.guards[id];
				if (!guard) return state;
				return {
					guards: {
						...state.guards,
						[id]: { ...guard, hasUnsavedChanges },
					},
				};
			}),

		getActiveGuard: () => {
			const { guards } = get();
			return (
				Object.values(guards).find((guard) => guard.hasUnsavedChanges) || null
			);
		},
	}),
);
