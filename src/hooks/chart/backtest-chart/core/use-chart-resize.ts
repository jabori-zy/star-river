import { useEffect, useRef } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";

interface UseChartResizeProps {
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartId: number;
}

/**
 * 处理图表容器 resize
 *
 * 职责：
 * 使用 ResizeObserver 监听容器尺寸变化，自动调整图表大小
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
