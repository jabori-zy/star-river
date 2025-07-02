import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface } from "scichart";
import initTestChart from "./init-test-chart";
import { useBacktestStrategyMarketDataStore } from "@/store/use-backtest-strategy-data-store";
import { useEffect, useRef } from "react";
import { IndicatorValue } from "@/types/indicator";

interface TestChartProps {
    indicatorKeyStr: string;
    indicatorName: string;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
}

export default function TestChart({ indicatorKeyStr, indicatorName, addSurfaceToGroup, addAxis }: TestChartProps) {

    const latestIndicatorData = useBacktestStrategyMarketDataStore(
        state => state.getLatestMarketData(indicatorKeyStr) as IndicatorValue   
    );

    const chartControlsRef = useRef<{
        onNewData: (data: IndicatorValue) => void;
        setIndicatorName: (name: string) => void;
        getDataSeries: () => any[];
        getRenderableSeries: () => any[];
        getIndicatorConfig: () => any;
    }>(undefined);  

    useEffect(() => {
        // 如果最新指标数据为空，则不进行更新
        if (!latestIndicatorData) return;

        if (chartControlsRef.current) {
            console.log(`指标 ${indicatorName} 数据更新:`, latestIndicatorData);
            // 传递完整的数据数组，让init-test-chart根据指标配置处理
            chartControlsRef.current.onNewData(latestIndicatorData);
        }
    }, [latestIndicatorData, indicatorName]);

    return (
        <SciChartReact
            initChart={(rootElement) => initTestChart(rootElement, indicatorKeyStr)}
            style={{ flexBasis: 100, flexGrow: 1, flexShrink: 1 }}
            onInit={(initResult: TResolvedReturnType<typeof initTestChart>) => {
                const { sciChartSurface, controls } = initResult;
                chartControlsRef.current = controls;
                // 设置指标名称
                if (controls.setIndicatorName) {
                    controls.setIndicatorName(indicatorName);
                }
                addSurfaceToGroup(sciChartSurface);
                addAxis(sciChartSurface.xAxes.get(0));
            }}
        />
    );
}