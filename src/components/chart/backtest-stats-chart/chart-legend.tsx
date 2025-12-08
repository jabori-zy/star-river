import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStatsLegend } from "@/hooks/chart/backtest-stats-chart";
import type { StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartStore } from "./backtest-stats-chart-store";
import { StatsLegend } from "./stats-legend";

interface ChartStatsLegendProps {
	strategyId: number;
	statsChartConfig: StrategyStatsChartConfig;
}

/**
 * Optimized subchart statistics Legend component
 * Uses React Portal instead of createRoot for simplified rendering flow
 */
export function ChartLegend({
	strategyId,
	statsChartConfig,
}: ChartStatsLegendProps) {
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null,
	);

	const { getStatsPaneRef, getChartRef, getPaneVersion } =
		useBacktestStatsChartStore(strategyId, {
			statsChartConfigs: [statsChartConfig],
		});

	// 🔑 Get pane version number to listen for pane changes
	const paneVersion = getPaneVersion();

	// 🔑 Get legend data and event handlers
	const { statsLegendData, onCrosshairMove } = useStatsLegend({
		strategyId,
		statsChartConfig,
	});

	const statsName = statsChartConfig.seriesConfigs.statsName;

	// 🔑 Delayed subscription to chart events to ensure chart is fully initialized
	useEffect(() => {
		// Use setTimeout to ensure subscription happens after chart is fully initialized
		const timer = setTimeout(() => {
			const chart = getChartRef();
			// Ensure chart exists, callback exists, and there is legend data
			if (!chart || !onCrosshairMove || !statsLegendData) return;
			// Directly subscribe to chart's mouse move event
			chart.subscribeCrosshairMove(onCrosshairMove);
		}, 10); // Delay 10ms to ensure chart initialization completes

		return () => {
			clearTimeout(timer);
			const chart = getChartRef();
			if (chart && onCrosshairMove) {
				chart.unsubscribeCrosshairMove(onCrosshairMove);
			}
		};
	}, [getChartRef, onCrosshairMove, statsLegendData]); // Add statsLegendData as dependency

	// 🔑 Create Portal container, responding to paneRef changes
	useEffect(() => {
		// Version number changes when pane is deleted, triggering container recreation
		void paneVersion; // Reference paneVersion to eliminate ESLint warning

		const createPortalContainer = () => {
			const paneRef = getStatsPaneRef(statsName);

			if (!paneRef) {
				// If pane is not ready yet, retry later
				setTimeout(createPortalContainer, 100);
				return;
			}

			setTimeout(() => {
				const htmlElement = paneRef.getHTMLElement();
				if (!htmlElement) {
					console.warn(`Unable to get subchart HTML element: ${statsName}`);
					return;
				}

				// Find the div containing the canvas element
				const canvasContainer = htmlElement.querySelector(
					'div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]',
				) as HTMLDivElement;

				if (!canvasContainer) {
					console.warn(`Unable to find canvas container element: ${statsName}`);
					return;
				}

				// Check if container already exists
				let container = canvasContainer.querySelector(
					`[data-stats-legend-key="${statsName}"]`,
				) as HTMLDivElement;

				if (!container) {
					// Create Portal container
					container = document.createElement("div");
					container.style.position = "absolute";
					container.style.top = "4px";
					container.style.left = "0px";
					container.style.zIndex = "10";
					container.style.pointerEvents = "auto";
					container.style.width = "100%";
					container.setAttribute("data-stats-legend-key", statsName);

					canvasContainer.appendChild(container);
				}

				setPortalContainer(container);
			}, 100);
		};

		createPortalContainer();

		// Cleanup function
		return () => {
			// Use closure to capture current portalContainer value
			setPortalContainer((currentContainer) => {
				if (currentContainer?.parentNode) {
					currentContainer.parentNode.removeChild(currentContainer);
				}
				return null;
			});
		};
	}, [statsName, getStatsPaneRef, paneVersion]); // Depends on statsName, will recreate container when pane is deleted

	// 🔑 Use Portal rendering, simple and direct
	if (!portalContainer || !statsLegendData) {
		return null;
	}

	return createPortal(
		<StatsLegend statsLegendData={statsLegendData} />,
		portalContainer,
	);
}
