import { toast } from "sonner";
import { getStrategyById } from "@/service/strategy";
import type { Strategy } from "@/types/strategy";

interface SaveFileResult {
	success: boolean;
	canceled?: boolean;
	filePath?: string;
	error?: string;
}

interface StandardizedStrategy {
	nodes: unknown[];
	edges: unknown[];
}

/**
 * Standardize strategy format for export
 * - Only keep nodes and edges fields
 * - Remove sensitive account information from nodes
 *
 * @param strategy Strategy object
 * @returns Standardized strategy with only nodes and edges
 */
export function standardizeStrategyForExport(
	strategy: Strategy,
): StandardizedStrategy {
	const nodes = strategy.nodes.map((node) => {
		// Deep clone the node to avoid mutating original data
		const clonedNode = JSON.parse(JSON.stringify(node));

		switch (clonedNode.type) {
			case "startNode":
				// Remove selectedAccounts from backtestConfig
				if (clonedNode.data?.backtestConfig?.exchangeModeConfig) {
					delete clonedNode.data.backtestConfig.exchangeModeConfig
						.selectedAccounts;
				}
				break;

			case "klineNode":
				// Remove selectedAccount from backtestConfig
				if (clonedNode.data?.backtestConfig?.exchangeModeConfig) {
					delete clonedNode.data.backtestConfig.exchangeModeConfig
						.selectedAccount;
				}
				break;

			case "indicatorNode":
				// Remove selectedAccount from backtestConfig
				if (clonedNode.data?.backtestConfig?.exchangeModeConfig) {
					delete clonedNode.data.backtestConfig.exchangeModeConfig
						.selectedAccount;
				}
				break;
		}

		return clonedNode;
	});

	return {
		nodes,
		edges: strategy.edges,
	};
}

/**
 * Export strategy to a txt file
 *
 * @param strategyId Strategy ID
 * @param strategyName Strategy name (used as default file name)
 */
export async function exportStrategy(
	strategyId: number,
	strategyName: string,
): Promise<void> {
	try {
		// Fetch strategy data
		const strategy = await getStrategyById(strategyId);

		// Standardize strategy format for export
		const standardizedStrategy = standardizeStrategyForExport(strategy);

		// Convert strategy to JSON string
		const content = JSON.stringify(standardizedStrategy, null, 2);

		// Check if running in Electron environment
		if (window.require) {
			const electronModule = window.require("electron");
			if (electronModule?.ipcRenderer) {
				const result: SaveFileResult = await electronModule.ipcRenderer.invoke(
					"save-file-dialog",
					{
						defaultFileName: `${strategyName}.txt`,
						content,
						filters: [{ name: "Text Files", extensions: ["txt"] }],
					},
				);

				if (result.canceled) {
					return;
				}

				if (result.success) {
					toast.success("Strategy exported successfully");
				} else {
					toast.error(`Export failed: ${result.error}`);
				}
			}
		} else {
			// Browser environment: use download link
			const blob = new Blob([content], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${strategyName}.txt`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success("Strategy exported successfully");
		}
	} catch (error) {
		console.error("Failed to export strategy:", error);
		toast.error("Failed to export strategy");
		throw error;
	}
}
