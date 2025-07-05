import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ChartCard from "../chart-card";
import { BacktestStrategyChartConfig } from '@/types/chart/backtest-chart';

interface ChartContainerProps {
  strategyChartConfig: BacktestStrategyChartConfig;
  strategyId: number;
  children?: React.ReactNode;
  onDelete: (chartId: number) => void;
  onUpdate: (chartId: number, klineCacheKeyStr: string, chartName: string) => void;
  onAddIndicator: (chartId: number, indicatorKey: string) => void;
}

export default function ChartContainer({ strategyChartConfig, strategyId, children, onDelete, onUpdate, onAddIndicator }: ChartContainerProps) {
  // 如果有children，使用children；否则根据strategyChartConfig.charts生成ChartCard
  const chartElements = children ? React.Children.toArray(children) : 
    strategyChartConfig.charts.map((chartConfig) => (
      <ChartCard 
        key={chartConfig.id} 
        chartConfig={chartConfig} 
        strategyId={strategyId}
        onDelete={onDelete} 
        onUpdate={onUpdate}
        onAddIndicator={onAddIndicator}
      />
    ));

  const chartCount = chartElements.length;
  const layout = strategyChartConfig.layout;

  // 如果没有图表，显示空状态
  if (chartCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        请选择图表数量
      </div>
    );
  }

  // 单个图表时，占满整个布局
  if (chartCount === 1) {
    return (
      <div className="w-full h-full p-2">
        {chartElements[0]}
      </div>
    );
  }

  // 网格布局
  if (layout === 'grid' || layout === 'grid-alt') {
    return renderGridLayout(chartElements, chartCount, layout);
  }

  // 横向布局（所有图表水平排列）
  if (layout === 'horizontal') {
    return (
      <div className="w-full h-full p-2">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full"
        >
          {chartElements.map((chart, index) => (
            <React.Fragment key={index}>
              <ResizablePanel 
                defaultSize={100 / chartCount} 
                minSize={15}
                className={index < chartCount - 1 ? "pr-1" : index > 0 ? "pl-1" : ""}
              >
                {chart}
              </ResizablePanel>
              {index < chartCount - 1 && <ResizableHandle withHandle />}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </div>
    );
  }

  // 纵向布局（默认，所有图表垂直排列）
  return (
    <div className="w-full h-full p-2">
      <ResizablePanelGroup
        direction="vertical"
        className="w-full h-full"
      >
        {chartElements.map((chart, index) => (
          <React.Fragment key={index}>
            <ResizablePanel 
              defaultSize={100 / chartCount} 
              minSize={15}
              className={index < chartCount - 1 ? "pb-1" : index > 0 ? "pt-1" : ""}
            >
              {chart}
            </ResizablePanel>
            {index < chartCount - 1 && <ResizableHandle withHandle />}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}

// 网格布局渲染函数
function renderGridLayout(chartElements: React.ReactNode[], chartCount: number, layoutMode: 'grid' | 'grid-alt') {
  // 计算网格尺寸
  const getGridDimensions = (count: number, isAlt: boolean) => {
    if (count === 1) return { rows: 1, cols: 1 };
    if (count === 2) return { rows: 1, cols: 2 };
    if (count === 3) return { rows: 2, cols: 2 }; // 第一行2个，第二行1个占满
    
    // 对于4及以上的图表
    if (count === 4) return { rows: 2, cols: 2 };
    
    if (isAlt) {
      // grid-alt: 奇数列，偶数行
      if (count <= 6) return { rows: 2, cols: 3 }; // 2行3列
      if (count <= 12) return { rows: 3, cols: 4 }; // 3行4列
      if (count <= 20) return { rows: 4, cols: 5 }; // 4行5列
      // 更多图表的处理
      const cols = Math.ceil(Math.sqrt(count)) + (Math.ceil(Math.sqrt(count)) % 2 === 0 ? 1 : 0); // 确保列数为奇数
      const rows = Math.ceil(count / cols);
      return { rows: rows % 2 === 0 ? rows : rows + 1, cols }; // 确保行数为偶数
    } else {
      // grid: 偶数列，奇数行（默认）
      if (count <= 6) return { rows: 3, cols: 2 }; // 3行2列
      if (count <= 8) return { rows: 3, cols: 4 }; // 3行4列，但实际只用到6-8个位置
      if (count === 9) return { rows: 3, cols: 3 }; // 3行3列
      if (count <= 12) return { rows: 3, cols: 4 }; // 3行4列
      if (count <= 16) return { rows: 5, cols: 4 }; // 5行4列
      // 更多图表的处理
      const cols = Math.ceil(Math.sqrt(count)) + (Math.ceil(Math.sqrt(count)) % 2 === 1 ? 1 : 0); // 确保列数为偶数
      const rows = Math.ceil(count / cols);
      return { rows: rows % 2 === 0 ? rows + 1 : rows, cols }; // 确保行数为奇数
    }
  };

  const { rows, cols } = getGridDimensions(chartCount, layoutMode === 'grid-alt');
  
  // 将图表分组到行中
  const chartRows: React.ReactNode[][] = [];
  for (let i = 0; i < rows; i++) {
    const startIndex = i * cols;
    const endIndex = Math.min(startIndex + cols, chartCount);
    if (startIndex < chartCount) {
      chartRows.push(chartElements.slice(startIndex, endIndex));
    }
  }

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup
        direction="vertical"
        className="w-full h-full"
      >
        {chartRows.map((rowCharts, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <ResizablePanel 
              defaultSize={100 / chartRows.length} // 使用实际行数
              minSize={10}
              className={rowIndex < chartRows.length - 1 ? "pb-1" : rowIndex > 0 ? "pt-1" : ""}
            >
              {/* 如果最后一行只有一个图表且不是单独成行的设计，让它占满整行 */}
              {rowCharts.length === 1 && rowIndex === chartRows.length - 1 && chartCount > 2 && chartCount !== 4 && chartCount !== 9 ? (
                rowCharts[0]
              ) : (
                <ResizablePanelGroup
                  direction="horizontal"
                  className="w-full h-full"
                >
                  {rowCharts.map((chart, colIndex) => (
                    <React.Fragment key={colIndex}>
                      <ResizablePanel 
                        defaultSize={100 / rowCharts.length} 
                        minSize={10}
                        className={colIndex < rowCharts.length - 1 ? "pr-1" : colIndex > 0 ? "pl-1" : ""}
                      >
                        {chart}
                      </ResizablePanel>
                      {colIndex < rowCharts.length - 1 && <ResizableHandle withHandle />}
                    </React.Fragment>
                  ))}
                </ResizablePanelGroup>
              )}
            </ResizablePanel>
            {rowIndex < chartRows.length - 1 && <ResizableHandle withHandle />}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
