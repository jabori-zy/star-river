import { useRef } from "react";
import { chartOptions } from "./chart-config";
import { useBacktestChart } from "@/hooks/chart";


interface BacktestChartNewProps {
    strategyId: number;
    chartId: number
}

const BacktestChartNew = ({ strategyId, chartId }: BacktestChartNewProps) => {
    console.log("图表刷新了");

    // 图表容器的引用
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // 使用 backtest chart hooks
    useBacktestChart({
        strategyId,
        chartId,
        chartContainerRef,
        chartOptions,
    });

	return (
        // 图表容器div
        <div ref={chartContainerRef} id="chart-container" className="w-full h-full" />
    );
};

export default BacktestChartNew;