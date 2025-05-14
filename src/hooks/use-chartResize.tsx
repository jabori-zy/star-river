import { useEffect } from "react";
import HighchartsReact from "highcharts-react-official";

interface ChartResizeOptions {
  width?: number | string;  // 可以是数字或百分比字符串
  height?: number | string; // 可以是数字或百分比字符串
  useReflow?: boolean;      // 是否使用reflow方法
}

// 将值转换为数字
const toNumber = (value: number | string | undefined, defaultValue?: number): number | undefined => {
  if (value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  // 尝试转换字符串为数字
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// 图表自适应钩子函数
const useChartResize = (
  chartRef: React.RefObject<HighchartsReact.RefObject | null>,
  options?: ChartResizeOptions
) => {
  useEffect(() => {
    const handleResize = () => {
      const chart = chartRef.current?.chart;
      if (!chart) return;
      
      // 如果提供了尺寸选项，则使用setSize方法
      if (options?.width !== undefined || options?.height !== undefined) {
        // 获取容器当前宽度和高度
        const container = chart.container;
        const defaultWidth = container ? container.clientWidth : undefined;
        const defaultHeight = container ? container.clientHeight : undefined;
        
        chart.setSize(
          toNumber(options.width, defaultWidth),
          // toNumber(options.height, defaultHeight),
          // false // 禁用动画
        );
      } 
      // 如果没有指定选项或明确设置useReflow为true，则使用reflow方法
      else if (!options || options.useReflow) {
        chart.reflow();
      }
    };

    // 初始调用一次以确保尺寸正确
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef, options]);
};

export default useChartResize;