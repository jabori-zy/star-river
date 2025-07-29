import React, { useEffect } from "react";
import { Chart, CandlestickSeries, Pane, LineSeries, TimeScale, TimeScaleFitContentTrigger, SeriesApiRef } from "lightweight-charts-react-components";
import { generateLineData } from "./mock-data";
import { CrosshairMode } from "lightweight-charts";
import { Card, CardContent} from "@/components/ui/card";
import { KlineLegend, useLegend } from "./legend";
import { useRealTimeKlineStore } from "./realTimeStore";
import { RealTimeControls } from "./RealTimeControls";

const lineData = generateLineData(100);
const lineData2 = generateLineData(100);

const BacktestChart = () => {
  const {
    reactive,
    resizeOnUpdate,
    data: realTimeData,
    isRunning,
    startSimulation,
    stopSimulation,
    setSeriesRef,
  } = useRealTimeKlineStore();

  const { ref, legendData, onCrosshairMove } = useLegend({ data: realTimeData });

  // 设置series引用到store中，这样store就可以直接使用series.update方法
  useEffect(() => {
    const checkAndSetSeries = () => {
      if (ref.current) {
        const seriesApi = ref.current.api();
        if (seriesApi) {
          console.log("设置series引用到store:", seriesApi);
          setSeriesRef(ref.current);
          return true;
        } else {
          console.warn("series API尚未可用，稍后重试");
          return false;
        }
      }
      return false;
    };

    // 立即检查
    if (!checkAndSetSeries()) {
      // 如果立即检查失败，延迟重试
      const timer = setTimeout(() => {
        checkAndSetSeries();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [ref, setSeriesRef]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, [stopSimulation]);

  const chartOptions = {
    autoSize: true,
    width: 600,
    height: 400,
    grid: {
      vertLines: {
        visible: false,
      },
      horzLines: {
        visible: false,
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        style: 3,
        color: "#080F25",
      },
      horzLine: {
        style: 3,
        color: "#080F25",
      },
    },
    layout: {
      panes: {
        separatorColor: "#080F25",
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <RealTimeControls />

      {/* 图表容器 */}
      <Card className="w-full">
        <CardContent>
          <div className="relative h-96 w-full">
            <Chart 
              options={chartOptions}
              onCrosshairMove={onCrosshairMove}
            >
              <Pane>
                <CandlestickSeries 
                  ref={ref}
                  data={realTimeData} 
                  reactive={false}
                  // options={{
                  //   upColor: '#22c55e',
                  //   downColor: '#ef4444',
                  //   borderUpColor: '#22c55e',
                  //   borderDownColor: '#ef4444',
                  //   wickUpColor: '#22c55e',
                  //   wickDownColor: '#ef4444',
                  // }}
                />
              </Pane>
              <Pane>
                <LineSeries data={lineData2} />
              </Pane>
              <TimeScale>
                <TimeScaleFitContentTrigger 
                  deps={resizeOnUpdate ? [realTimeData.length] : []} 
                />
              </TimeScale>
            </Chart>
            <KlineLegend klineSeriesData={legendData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { BacktestChart };