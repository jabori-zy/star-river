import { useEffect, useRef } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";

interface UseChartResizeProps {
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartId: number;
}

/**
 * Handle chart container resize
 *
 * Responsibilities:
 * Use ResizeObserver to monitor container size changes and automatically adjust chart size
 */
export const useChartResize = ({
	chartContainerRef,
	chartId,
}: UseChartResizeProps): void => {
	const { getChartRef } = useBacktestChartStore(chartId);
	const resizeObserver = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		resizeObserver.current = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			const chart = getChartRef();
			chart?.resize(width, height - 0.5);
		});

		if (chartContainerRef.current) {
			resizeObserver.current.observe(chartContainerRef.current);
		}

		return () => resizeObserver.current?.disconnect();
	}, [getChartRef, chartContainerRef]);
};

export type { UseChartResizeProps };
