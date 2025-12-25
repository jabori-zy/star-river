import { useEffect } from "react";
import {
	type NavigationGuard,
	useNavigationGuardStore,
} from "@/store/use-navigation-guard-store";

interface UseNavigationGuardOptions {
	id: string;
	hasUnsavedChanges: boolean;
	title?: string;
	description?: string;
	onSave?: () => Promise<void> | void;
}

/**
 * Hook to register a navigation guard for the current page.
 * When hasUnsavedChanges is true, navigating away will show a confirmation dialog.
 */
export function useNavigationGuard({
	id,
	hasUnsavedChanges,
	title,
	description,
	onSave,
}: UseNavigationGuardOptions) {
	const { registerGuard, unregisterGuard, updateGuard } =
		useNavigationGuardStore();

	// Register guard on mount
	useEffect(() => {
		const guard: NavigationGuard = {
			id,
			hasUnsavedChanges,
			title,
			description,
			onSave,
		};
		registerGuard(guard);

		return () => {
			unregisterGuard(id);
		};
		// Only register/unregister on mount/unmount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Update hasUnsavedChanges when it changes
	useEffect(() => {
		updateGuard(id, hasUnsavedChanges);
	}, [id, hasUnsavedChanges, updateGuard]);

	// Update other properties when they change
	useEffect(() => {
		const { guards, registerGuard } = useNavigationGuardStore.getState();
		const existingGuard = guards[id];
		if (existingGuard) {
			registerGuard({
				...existingGuard,
				title,
				description,
				onSave,
			});
		}
	}, [id, title, description, onSave]);
}
