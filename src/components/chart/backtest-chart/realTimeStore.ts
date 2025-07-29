import dayjs from "dayjs";
import { create } from "zustand";
import { generateOHLCData, generateNextDataPoint, type FlexibleCandlestickData } from "./mock-data";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { ISeriesApi } from "lightweight-charts";

let interval: NodeJS.Timeout | null = null;

interface RealTimeKlineStore {
  reactive: boolean;
  resizeOnUpdate: boolean;
  data: FlexibleCandlestickData[];
  isRunning: boolean;
  seriesRef: SeriesApiRef<"Candlestick"> | null;
  
  setReactive: (reactive: boolean) => void;
  setResizeOnUpdate: (resizeOnUpdate: boolean) => void;
  setData: (data: FlexibleCandlestickData[]) => void;
  setSeriesRef: (ref: SeriesApiRef<"Candlestick">) => void;
  updateSinglePoint: (point: FlexibleCandlestickData) => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  resetData: () => void;
}

export const useRealTimeKlineStore = create<RealTimeKlineStore>((set, get) => ({
  reactive: true,
  resizeOnUpdate: false,
  data: generateOHLCData(50),
  isRunning: false,
  seriesRef: null,
  
  setReactive: (reactive: boolean) => set({ reactive }),
  setResizeOnUpdate: (resizeOnUpdate: boolean) => set({ resizeOnUpdate }),
  setData: (data: FlexibleCandlestickData[]) => set(() => ({ data })),
  setSeriesRef: (ref: SeriesApiRef<"Candlestick">) => set({ seriesRef: ref }),
  
  updateSinglePoint: (point: FlexibleCandlestickData) => {
    const state = get();
    console.log("updateSinglePoint被调用");
    console.log("seriesRef:", state.seriesRef);
    
    if (state.seriesRef) {
      const series = state.seriesRef.api();
      console.log("series API:", series);
      
      if (series) {
        // 使用 series.update 方法更新单个数据点
        console.log("更新数据点", point);
        try {
          series.update(point);
          console.log("成功更新数据点");
        } catch (error) {
          console.error("更新数据点时出错:", error);
        }
        
        // 同时更新store中的数据数组，保持数据同步
        const dataLimit = 10000;
        set(prevState => ({
          data: prevState.data.length >= dataLimit
            ? [...prevState.data.slice(1), point]
            : [...prevState.data, point],
        }));
      } else {
        console.log("series API为null，seriesRef存在但API不可用");
        // 回退方案
        const dataLimit = 10000;
        set(prevState => ({
          data: prevState.data.length >= dataLimit
            ? [...prevState.data.slice(1), point]
            : [...prevState.data, point],
        }));
      }
    } else {
      // 如果series引用不可用，回退到原来的方法
      console.log("seriesRef为null，series引用不可用，使用回退方案");
      const dataLimit = 10000;
      set(prevState => ({
        data: prevState.data.length >= dataLimit
          ? [...prevState.data.slice(1), point]
          : [...prevState.data, point],
      }));
    }
  },
  
  startSimulation: () => {
    if (interval) return;

    set({ isRunning: true });
    interval = setInterval(() => {
      const state = get();
      const last = state.data[state.data.length - 1];
      console.log("最后一个数据点:", last);
      const next = generateNextDataPoint(last);
      console.log("生成的下一个数据点:", next);
      
      // 使用新的单点更新方法
      state.updateSinglePoint(next);
    }, 1000); // 每秒更新一次
  },

  stopSimulation: () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
      set({ isRunning: false });
    }
  },

  resetData: () => {
    const { stopSimulation } = get();
    stopSimulation();
    set({ data: generateOHLCData(50) });
  },
})); 