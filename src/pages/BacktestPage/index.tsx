import RealtimeTickingStockCharts from "../../components/chart/SciChart";
import useBacktestStrategySSE from "../../hooks/use-backtestStrategySSE";

export default function BacktestPage() {
    useBacktestStrategySSE();


    return (
        <div className="flex flex-col h-full">
            <RealtimeTickingStockCharts />
        </div>
    )
}