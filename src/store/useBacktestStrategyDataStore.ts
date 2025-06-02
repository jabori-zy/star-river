import { create } from 'zustand';
import { CacheKeyStr } from '@/types/cache';

// 定义缓存大小常量
const MAX_CACHE_SIZE = 20;

// 回测策略数据存储
interface BacktestStrategyDataState {
  // 按数据的缓存键存储的数据列表
  backtestStrategyData: Record<CacheKeyStr, number[][]>;
  
  // 添加新数据到指定的缓存key中，自动控制缓存大小
  addData: (cacheKey: CacheKeyStr, data: number[]) => void;
  
  // 清空特定缓存key的所有数据
  clearData: (cacheKey: CacheKeyStr) => void;
  
  // 清空所有数据
  clearAllData: () => void;
  
  // 获取指定缓存key的最新数据
  getLatestData: (cacheKey: CacheKeyStr) => number[] | undefined;

  // 获取所有的缓存key的数据
  getAllData: () => Record<CacheKeyStr, number[][]>;
}

export const useBacktestStrategyDataStore = create<BacktestStrategyDataState>((set, get) => ({
  // 初始化事件存储
  backtestStrategyData: {},
  
  // 添加数据到指定缓存key中，限制缓存大小为 MAX_CACHE_SIZE
  addData: (cacheKey, data) => set((state) => {
    // 判断cacheKey是否存在
    if (!state.backtestStrategyData[cacheKey]) {
      state.backtestStrategyData[cacheKey] = [];
    }
    const currentData = state.backtestStrategyData[cacheKey];
    // 如果当前数据数组已达到最大容量，则移除最早的数据
    let newData;
    if (currentData.length >= MAX_CACHE_SIZE) {
      // 移除第一个元素(最旧的)，并添加新事件到末尾
      newData = [...currentData.slice(1), data];
    } else {
      // 直接添加新事件到末尾
      newData = [...currentData, data];
    }
    
    return {
      backtestStrategyData: {
        ...state.backtestStrategyData,
        [cacheKey]: newData
      }
    };
  }),
  
  // 清空特定缓存key的所有数据
  clearData: (cacheKey) => set((state) => ({
    backtestStrategyData: {
      ...state.backtestStrategyData,
      [cacheKey]: []
    }
  })),
  
  // 清空所有数据
  clearAllData: () => set({
    backtestStrategyData: {}
  }),
  
  // 获取指定缓存key的最新数据
  getLatestData: (cacheKey) => {
    const cache = get().backtestStrategyData[cacheKey];
    if (!cache || cache.length === 0) return undefined;
    return cache[cache.length - 1];
  },

  // 获取所有的缓存key的数据
  getAllData: () => {
    return get().backtestStrategyData;
  },
}));
