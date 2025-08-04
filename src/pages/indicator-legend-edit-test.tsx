import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IndicatorLegendEditDialog } from '@/components/chart/backtest-chart/legend/indicator-legend-edit-dialog';
import { SeriesType } from '@/types/chart';
import type { IndicatorKeyStr } from '@/types/symbol-key';
import { useBacktestChartConfigStore } from '@/store/use-backtest-chart-config-store';
import type { BacktestChartConfig } from '@/types/chart/backtest-chart';

export default function IndicatorLegendEditTest() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setChartConfig, chartConfig } = useBacktestChartConfigStore();

  // 创建测试数据
  React.useEffect(() => {
    const testChartConfig: BacktestChartConfig = {
      id: 1,
      chartName: "测试图表",
      klineChartConfig: {
        klineKeyStr: "BTCUSDT_1h",
        upColor: "#26a69a",
        downColor: "#ef5350",
      },
      indicatorChartConfigs: [
        {
          chartId: 1,
          indicatorKeyStr: "MACD(ma_type=EMA fast_period=12 slow_period=26 signal_period=9 price_source=close)" as IndicatorKeyStr,
          isDelete: false,
          isInMainChart: false,
          seriesConfigs: [
            {
              name: "MACD",
              type: SeriesType.LINE,
              color: "#FF6B6B",
              strokeThickness: 2,
              indicatorValueKey: "macd"
            },
            {
              name: "Signal",
              type: SeriesType.DASH,
              color: "#4ECDC4",
              strokeThickness: 1,
              indicatorValueKey: "signal"
            },
            {
              name: "Histogram",
              type: SeriesType.COLUMN,
              color: "#45B7D1",
              strokeThickness: 1,
              indicatorValueKey: "histogram"
            }
          ]
        }
      ]
    };

    setChartConfig({
      charts: [testChartConfig],
      layout: "vertical"
    });
  }, [setChartConfig]);

  const testIndicatorKeyStr = "MACD(ma_type=EMA fast_period=12 slow_period=26 signal_period=9 price_source=close)" as IndicatorKeyStr;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">指标图例编辑测试</h1>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          这个页面用于测试指标图例的编辑功能。点击下面的按钮打开编辑对话框。
        </p>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          打开MACD指标编辑对话框
        </Button>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">测试说明：</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>点击按钮打开编辑对话框</li>
            <li>对话框应该显示MACD指标的3个系列配置</li>
            <li>可以编辑每个系列的名称和颜色</li>
            <li>修改会实时保存到store中</li>
            <li>无需确认和取消按钮</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">当前配置状态：</h3>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(chartConfig, null, 2)}
          </pre>
        </div>
      </div>

      <IndicatorLegendEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        chartId={1}
        indicatorKeyStr={testIndicatorKeyStr}
      />
    </div>
  );
}
