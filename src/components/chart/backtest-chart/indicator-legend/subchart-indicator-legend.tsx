import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useIndicatorLegend } from "@/components/chart/backtest-chart/hooks/use-indicator-legend";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import { IndicatorLegend } from "./indicator-legend";

// Stable empty object reference to avoid infinite loop caused by || {}
const EMPTY_SERIES_MAP: Record<string, unknown> = {};

interface SubchartIndicatorLegendProps {
	chartId: number;
	indicatorKeyStr: IndicatorKeyStr;
}

/**
 * Optimized subchart indicator Legend component
 * Uses React Portal instead of createRoot to simplify rendering process
 */
export function SubchartIndicatorLegend({
	chartId,
	indicatorKeyStr,
}: SubchartIndicatorLegendProps) {
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null,
	);
	const {
		getIndicatorSubChartPaneRef,
		getPaneVersion,
		getIndicatorSubChartPaneHtmlElementRef,
		indicatorSubChartPaneHtmlElementRef,
		chartRef,
		indicatorSeriesRef,
	} = useBacktestChartStore(chartId);

	// Use stable reference to avoid infinite loop
	const indicatorSeriesMap = useMemo(
		() => indicatorSeriesRef[indicatorKeyStr] ?? EMPTY_SERIES_MAP,
		[indicatorSeriesRef, indicatorKeyStr],
	);

	// Get current pane version number to listen for pane changes
	const paneVersion = getPaneVersion();

	// Get legend data and event handlers
	const { legendData, onCrosshairMove, onSeriesDataUpdate } =
		useIndicatorLegend({
			chartId,
			indicatorKeyStr,
		});

	// Delay subscribing to chart events to ensure chart is fully initialized
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> we don't need to re-run this effect when indicatorKeyStr changes
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) {
			return;
		}

		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, indicatorKeyStr, onCrosshairMove]);

	useEffect(() => {
		const seriesList = Object.values(indicatorSeriesMap).filter(
			(seriesRef): seriesRef is NonNullable<typeof seriesRef> =>
				Boolean(seriesRef),
		);

		if (seriesList.length === 0) {
			return;
		}

		seriesList.forEach((seriesRef) => {
			seriesRef.subscribeDataChanged(onSeriesDataUpdate);
		});

		return () => {
			seriesList.forEach((seriesRef) => {
				seriesRef.unsubscribeDataChanged(onSeriesDataUpdate);
			});
		};
	}, [indicatorSeriesMap, onSeriesDataUpdate]);

	// Create Portal container, responding to paneRef changes
	useEffect(() => {
		// Version number changes when pane is deleted, triggering container recreation
		void paneVersion; // Reference paneVersion to eliminate ESLint warning
		void indicatorSubChartPaneHtmlElementRef; // Reference indicatorSubChartPaneHtmlElementRef to eliminate ESLint warning

		const createPortalContainer = () => {
			const paneRef = getIndicatorSubChartPaneRef(indicatorKeyStr);

			if (!paneRef) {
				// If pane is not ready yet, retry later
				setTimeout(createPortalContainer, 100);
				return;
			}

			setTimeout(() => {
				// console.log("indicatorSubChartPaneHtmlElementRef", indicatorSubChartPaneHtmlElementRef);
				const htmlElement = getIndicatorSubChartPaneHtmlElementRef(indicatorKeyStr);
				if (!htmlElement) {
					// console.warn(`Cannot get subchart HTML element: ${indicatorKeyStr}`);
					return;
				}

				// Find div containing canvas element
				const canvasContainer = htmlElement.querySelector(
					'div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]',
				) as HTMLDivElement;

				if (!canvasContainer) {
					console.warn(`Cannot find canvas container element: ${indicatorKeyStr}`);
					return;
				}

				// Check if container already exists
				let container = canvasContainer.querySelector(
					`[data-legend-key="${indicatorKeyStr}"]`,
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
					container.setAttribute("data-legend-key", indicatorKeyStr);

					canvasContainer.appendChild(container);
				}

				setPortalContainer(container);
			}, 50);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		indicatorKeyStr,
		getIndicatorSubChartPaneRef,
		paneVersion,
		getIndicatorSubChartPaneHtmlElementRef,
		indicatorSubChartPaneHtmlElementRef,
	]); // Depend on paneVersion, container will be recreated when pane is deleted

	// Use Portal for rendering, simple and direct
	if (!portalContainer || !legendData) {
		return null;
	}

	return createPortal(
		<IndicatorLegend
			indicatorLegendData={legendData}
			indicatorKeyStr={indicatorKeyStr}
			chartId={chartId}
		/>,
		portalContainer,
	);
}
