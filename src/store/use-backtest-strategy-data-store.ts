import { create } from 'zustand';
import { CacheKeyStr } from '@/types/cache';
import { Kline } from '@/types/kline';
import { IndicatorValue } from '@/types/indicator';

// 定义缓存大小常量
const MAX_CACHE_SIZE = 20;

// 回测策略数据存储
interface BacktestStrategyMarketDataState {
  // 按数据的缓存键存储的数据列表
  marketData: Record<CacheKeyStr, (Kline | IndicatorValue)[]>;
  
  // 添加新数据到指定的缓存key中，自动控制缓存大小
  addMarketData: (cacheKey: CacheKeyStr, data: (Kline | IndicatorValue)[]) => void;
  
  // 清空特定缓存key的所有数据
  clearMarketData: (cacheKey: CacheKeyStr) => void;
  
  // 清空所有数据
  clearAllMarketData: () => void;
  
  // 获取指定缓存key的最新数据
  getLatestMarketData: (cacheKey: CacheKeyStr) => Kline | IndicatorValue | undefined;

  // 获取所有的缓存key的数据
  getAllMarketData: () => Record<CacheKeyStr, (Kline | IndicatorValue)[]>;
}

export const useBacktestStrategyMarketDataStore = create<BacktestStrategyMarketDataState>((set, get) => ({
  // 初始化事件存储
  marketData: {},
  
  // 添加数据到指定缓存key中，限制缓存大小为 MAX_CACHE_SIZE
  addMarketData: (cacheKey, data) => set((state) => {
    // 判断cacheKey是否存在
    if (!state.marketData[cacheKey]) {
      state.marketData[cacheKey] = [];
    }
    const currentData = state.marketData[cacheKey];
    // 如果当前数据数组已达到最大容量，则移除最早的数据
    let newData;
    if (currentData.length >= MAX_CACHE_SIZE) {
      // 移除第一个元素(最旧的)，并添加新事件到末尾
      newData = [...currentData.slice(1), ...data];
    } else {
      // 直接添加新事件到末尾
      newData = [...currentData, ...data];
    }
    // console.log("marketData", state.marketData);
    
    return {
      marketData: {
        ...state.marketData,
        [cacheKey]: newData
      }
    };
  }),
  
  // 清空特定缓存key的所有数据
  clearMarketData: (cacheKey) => set((state) => ({
    marketData: {
      ...state.marketData,
      [cacheKey]: []
    }
  })),
  
  // 清空所有数据
  clearAllMarketData: () => set({
    marketData: {}
  }),
  
  // 获取指定缓存key的最新数据
  getLatestMarketData: (cacheKey) => {
    const cache = get().marketData[cacheKey];
    if (!cache || cache.length === 0) return undefined;
    return cache[cache.length - 1];
  },

  // 获取所有的缓存key的数据
  getAllMarketData: () => {
    return get().marketData;
  },
}));
