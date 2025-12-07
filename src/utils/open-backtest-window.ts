import { toast } from "sonner";

/**
 * Open backtest window
 *
 * Chooses different opening methods based on runtime environment (Electron or browser):
 * - Electron environment: Opens new window via IPC call
 * - Browser environment: Opens new tab using window.open
 *
 * @param strategyId Strategy ID
 */
export async function openBacktestWindow(
	strategyId: number,
	strategyName: string,
): Promise<void> {
	try {
		// Check if running in Electron environment
		if (window.require) {
			// Electron environment: open new window
			const electronModule = window.require("electron");
			if (electronModule?.ipcRenderer) {
				await electronModule.ipcRenderer.invoke(
					"open-backtest-window",
					strategyId,
					strategyName,
				);
			}
		} else {
			// Browser environment: open new tab (using Hash Router format)
			const backtestUrl = `/#/backtest/${strategyId}?strategyName=${encodeURIComponent(strategyName)}`;
			window.open(backtestUrl, "_blank", "width=1200,height=800");
		}
	} catch (error) {
		console.error("Failed to open backtest window:", error);
		toast.error("Failed to open backtest window");
		throw error;
	}
}
