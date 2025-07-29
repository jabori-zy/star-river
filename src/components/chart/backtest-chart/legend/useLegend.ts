import dayjs from "dayjs";
import { useCallback, useRef, useState, useEffect } from "react";
import { colors } from "./colors";
import { generateOHLCData } from "../mock-data";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { CandlestickData, createChart } from "lightweight-charts";
import type {
  ISeriesApi,
  MouseEventParams,
  Time,
  WhitespaceData,
} from "lightweight-charts";

// const chart = createChart(container, chartOptions);


// const series = chart.addSeries(CandlestickSeries, {
//     upColor: '#26a69a',
//     downColor: '#ef5350',
//     borderVisible: false,
//     wickUpColor: '#26a69a',
//     wickDownColor: '#ef5350',
// });

export type LegendData = {
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  time: string;
  color?: string;
  change?: string;
};

export const seriesData = generateOHLCData(100);

const isCandlestickData = (data: CandlestickData<Time> | WhitespaceData<Time> | undefined): data is CandlestickData<Time> => {
  return data != null && "close" in data && "open" in data && "high" in data && "low" in data;
};

const timeToString = (time: Time): string => {
  if (typeof time === "number") {
    return dayjs(time * 1000).format("YYYY-MM-DD");
  }

  if (typeof time === "object") {
    const date = new Date(time.year, time.month - 1, time.day);
    return dayjs(date).format("YYYY-MM-DD");
  }

  return time;
};

const mapCandlestickDataToLegendData = ({
  open,
  high,
  low,
  close,
  time,
}: CandlestickData): LegendData => {
  const decreased = open > close;
  const sign = decreased ? "-" : "+";
  const difference = Math.abs(close - open);

  return {
    open: open.toFixed(2),
    high: high.toFixed(2),
    low: low.toFixed(2),
    close: close.toFixed(2),
    time: timeToString(time),
    color: decreased ? colors.red : colors.green,
    change: `${sign}${difference.toFixed(2)} (${sign}${((difference / open) * 100).toFixed(2)}%)`,
  };
};

const getLastBarLegendData = (s: ISeriesApi<"Candlestick">): LegendData | null => {
  const data = s.dataByIndex(Number.MAX_SAFE_INTEGER, -1);

  if (!data) {
    return null;
  }

  if (!isCandlestickData(data)) {
    return null;
  }

  return mapCandlestickDataToLegendData(data);
};

interface UseLegendOptions {
  data?: CandlestickData[];
}

export const useLegend = (options: UseLegendOptions = {}) => {
  const { data = seriesData } = options;
  const ref = useRef<SeriesApiRef<"Candlestick">>(null);
  
  // 使用传入的数据或默认数据来初始化 legendData
  const [legendData, setLegendData] = useState<LegendData | null>(() => {
    if (data && data.length > 0) {
      return mapCandlestickDataToLegendData(data[data.length - 1]);
    }
    return null;
  });

  // 🔧 修复：监听数据变化，自动更新 legendData
  useEffect(() => {
    if (data && data.length > 0) {
      const lastDataPoint = data[data.length - 1];
      const newLegendData = mapCandlestickDataToLegendData(lastDataPoint);
      setLegendData(prev => {
        // 只有在时间不同时才更新，避免不必要的渲染
        if (prev?.time !== newLegendData.time) {
          return newLegendData;
        }
        return prev;
      });
    }
  }, [data]);

  const onCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      if (!ref.current) {
        return;
      }

      const seriesApi = ref.current.api();
      if (!seriesApi) {
        return;
      }

      if (!param) {
        return;
      }

      if (!param.time) {
        const lastBarData = getLastBarLegendData(seriesApi);
        setLegendData(prev => (prev?.time !== lastBarData?.time ? lastBarData : prev));
        return;
      }

      // 获取数据，可能为 undefined
      const dataFromChart = param.seriesData.get(seriesApi);

      // 先检查是否为 undefined，再进行类型检查
      if (!isCandlestickData(dataFromChart)) {
        setLegendData(null);
        return;
      }

      const newLegendData = mapCandlestickDataToLegendData(dataFromChart);
      setLegendData(prev => (prev?.time !== newLegendData.time ? newLegendData : prev));
    },
    []
  );

  return {
    ref,
    legendData,
    onCrosshairMove,
  };
}; 