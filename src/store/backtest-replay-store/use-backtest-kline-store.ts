import { create } from 'zustand';
import { CacheKeyStr } from '@/types/cache';
import { Kline } from '@/types/kline';

// 定义缓存大小常量
const MAX_CACHE_SIZE = 20;

// 回测K线数据存储
interface BacktestKlineDataState {
  // 按数据的缓存键存储的K线数据列表
  klineData: Record<CacheKeyStr, Kline[]>;
  
  // 添加新K线数据到指定的缓存key中，自动控制缓存大小
  addKlineData: (cacheKey: CacheKeyStr, data: Kline[]) => void;
  
  // 清空特定缓存key的所有K线数据
  clearKlineData: (cacheKey: CacheKeyStr) => void;
  
  // 清空所有K线数据
  clearAllKlineData: () => void;
  
  // 获取指定缓存key的最新K线数据
  getLatestKlineData: (cacheKey: CacheKeyStr) => Kline | undefined;

  // 获取所有的缓存key的K线数据
  getAllKlineData: () => Record<CacheKeyStr, Kline[]>;
}

export const useBacktestKlineDataStore = create<BacktestKlineDataState>((set, get) => ({
  // 初始化K线数据存储
  klineData: {},
  
  // 添加K线数据到指定缓存key中，限制缓存大小为 MAX_CACHE_SIZE
  addKlineData: (cacheKey, data) => set((state) => {
    // 判断cacheKey是否存在
    if (!state.klineData[cacheKey]) {
      state.klineData[cacheKey] = [];
    }
    const currentData = state.klineData[cacheKey];
    // 如果当前数据数组已达到最大容量，则移除最早的数据
    let newData;
    if (currentData.length >= MAX_CACHE_SIZE) {
      // 移除第一个元素(最旧的)，并添加新数据到末尾
      newData = [...currentData.slice(1), ...data];
    } else {
      // 直接添加新数据到末尾
      newData = [...currentData, ...data];
    }
    // console.log("klineData", state.klineData);
    
    return {
      klineData: {
        ...state.klineData,
        [cacheKey]: newData
      }
    };
  }),
  
  // 清空特定缓存key的所有K线数据
  clearKlineData: (cacheKey) => set((state) => ({
    klineData: {
      ...state.klineData,
      [cacheKey]: []
    }
  })),
  
  // 清空所有K线数据
  clearAllKlineData: () => set({
    klineData: {}
  }),
  
  // 获取指定缓存key的最新K线数据
  getLatestKlineData: (cacheKey) => {
    const cache = get().klineData[cacheKey];
    if (!cache || cache.length === 0) return undefined;
    return cache[cache.length - 1];
  },

  // 获取所有的缓存key的K线数据
  getAllKlineData: () => {
    return get().klineData;
  },
}));
