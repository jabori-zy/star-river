import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useOperationLegend } from "@/components/chart/backtest-chart/hooks/use-operation-legend";
import type { OperationKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import { OperationLegend } from "./operation-legend";

// Stable empty object reference to avoid infinite loop caused by || {}
const EMPTY_SERIES_MAP: Record<string, unknown> = {};

interface SubchartOperationLegendProps {
	chartId: number;
	operationKeyStr: OperationKeyStr;
}

/**
 * Optimized subchart operation Legend component
 * Uses React Portal instead of createRoot to simplify rendering process
 */
export function SubchartOperationLegend({
	chartId,
	operationKeyStr,
}: SubchartOperationLegendProps) {
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null,
	);
	const {
		getOperationSubChartPaneRef,
		getPaneVersion,
		getOperationSubChartPaneHtmlElementRef,
		operationSubChartPaneHtmlElementRef,
		chartRef,
		operationSeriesRef,
	} = useBacktestChartStore(chartId);

	// Use stable reference to avoid infinite loop
	const operationSeriesMap = useMemo(
		() => operationSeriesRef[operationKeyStr] ?? EMPTY_SERIES_MAP,
		[operationSeriesRef, operationKeyStr],
	);

	// Get current pane version number to listen for pane changes
	const paneVersion = getPaneVersion();

	// Get legend data and event handlers
	const { legendData, onCrosshairMove, onSeriesDataUpdate } =
		useOperationLegend({
			chartId,
			operationKeyStr,
		});

	// Delay subscribing to chart events to ensure chart is fully initialized
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) {
			return;
		}

		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, onCrosshairMove]);

	useEffect(() => {
		const seriesList = Object.values(operationSeriesMap).filter(
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
	}, [operationSeriesMap, onSeriesDataUpdate]);

	// Create Portal container, responding to paneRef changes
	useEffect(() => {
		// Version number changes when pane is deleted, triggering container recreation
		void paneVersion; // Reference paneVersion to eliminate ESLint warning
		void operationSubChartPaneHtmlElementRef; // Reference operationSubChartPaneHtmlElementRef to eliminate ESLint warning

		const createPortalContainer = () => {
			const paneRef = getOperationSubChartPaneRef(operationKeyStr);

			if (!paneRef) {
				// If pane is not ready yet, retry later
				setTimeout(createPortalContainer, 100);
				return;
			}

			setTimeout(() => {
				const htmlElement = getOperationSubChartPaneHtmlElementRef(operationKeyStr);
				if (!htmlElement) {
					return;
				}

				// Find div containing canvas element
				const canvasContainer = htmlElement.querySelector(
					'div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]',
				) as HTMLDivElement;

				if (!canvasContainer) {
					console.warn(`Cannot find canvas container element: ${operationKeyStr}`);
					return;
				}

				// Check if container already exists
				let container = canvasContainer.querySelector(
					`[data-legend-key="${operationKeyStr}"]`,
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
					container.setAttribute("data-legend-key", operationKeyStr);

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
		operationKeyStr,
		getOperationSubChartPaneRef,
		paneVersion,
		getOperationSubChartPaneHtmlElementRef,
		operationSubChartPaneHtmlElementRef,
	]); // Depend on paneVersion, container will be recreated when pane is deleted

	// Use Portal for rendering, simple and direct
	if (!portalContainer || !legendData) {
		return null;
	}

	return createPortal(
		<OperationLegend
			operationLegendData={legendData}
			operationKeyStr={operationKeyStr}
			chartId={chartId}
		/>,
		portalContainer,
	);
}
