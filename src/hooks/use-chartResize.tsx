import type HighchartsReact from "highcharts-react-official";
import { useEffect } from "react";

interface ChartResizeOptions {
	width?: number | string; // Can be a number or percentage string
	height?: number | string; // Can be a number or percentage string
	useReflow?: boolean; // Whether to use reflow method
}

// Convert value to number
const toNumber = (
	value: number | string | undefined,
	defaultValue?: number,
): number | undefined => {
	if (value === undefined) return defaultValue;
	if (typeof value === "number") return value;
	// Attempt to convert string to number
	const parsed = parseFloat(value);
	return Number.isNaN(parsed) ? defaultValue : parsed;
};

// Chart responsive resize hook function
const useChartResize = (
	chartRef: React.RefObject<HighchartsReact.RefObject | null>,
	options?: ChartResizeOptions,
) => {
	useEffect(() => {
		const handleResize = () => {
			const chart = chartRef.current?.chart;
			if (!chart) return;

			// If size options are provided, use setSize method
			if (options?.width !== undefined || options?.height !== undefined) {
				// Get container's current width and height
				const container = chart.container;
				const defaultWidth = container ? container.clientWidth : undefined;
				const defaultHeight = container ? container.clientHeight : undefined;

				chart.setSize(
					toNumber(options.width, defaultWidth),
					// toNumber(options.height, defaultHeight),
					// false // Disable animation
				);
			}
			// If no options are specified or useReflow is explicitly set to true, use reflow method
			else if (!options || options.useReflow) {
				chart.reflow();
			}
		};

		// Initial call once to ensure correct sizing
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [chartRef, options]);
};

export default useChartResize;
