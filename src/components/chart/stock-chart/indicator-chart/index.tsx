import { SciChartReact, TResolvedReturnType} from "scichart-react";
import { AxisBase2D, SciChartSurface, XyDataSeries } from "scichart";
import initIndicatorChart from "./init-indicator-chart";
import { useEffect, useRef } from "react";
import { IndicatorValue } from "@/types/indicator";
import { Button } from "@/components/ui/button";
import { useBacktestIndicatorDataStore } from "@/store/backtest-replay-store/use-backtest-indicator-store";
import { IndicatorChartConfig } from "@/types/indicator/indicator-chart-config";

interface IndicatorChartProps {
    indicatorKeyStr: string;
    indicatorName: string;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
}

export default function IndicatorChart({ indicatorKeyStr, indicatorName, addSurfaceToGroup, addAxis }: IndicatorChartProps) {

    const latestIndicatorData = useBacktestIndicatorDataStore(
        state => state.getLatestIndicatorData(indicatorKeyStr) as IndicatorValue   
    );

    const chartControlsRef = useRef<{
        onNewData: (data: IndicatorValue) => void;
        getDataSeries: () => XyDataSeries[];
        getIndicatorConfig: () => IndicatorChartConfig;
    }>(undefined);  

    useEffect(() => {
        // 如果最新指标数据为空，则不进行更新
        if (!latestIndicatorData) return;

        if (chartControlsRef.current) {
            // console.log(`指标 ${indicatorName} 数据更新:`, latestIndicatorData);
            // 传递完整的数据数组，让init-test-chart根据指标配置处理
            chartControlsRef.current.onNewData(latestIndicatorData);
        }
    }, [latestIndicatorData, indicatorName]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-12 z-10"
                onClick={() => console.log('图表按钮点击')}
            >
                设置
            </Button>
            <SciChartReact
                initChart={(rootElement) => initIndicatorChart(rootElement, indicatorKeyStr)}
                style={{ flexBasis: 100, flexGrow: 1, flexShrink: 1 }}
                onInit={(initResult: TResolvedReturnType<typeof initIndicatorChart>) => {
                    const { sciChartSurface, controls } = initResult;
                    chartControlsRef.current = controls;
                    // 设置指标名称
                    addSurfaceToGroup(sciChartSurface);
                    addAxis(sciChartSurface.xAxes.get(0));
                }}
            />
        </div>
    );
}