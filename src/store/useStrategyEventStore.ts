import { create } from 'zustand';
import { StrategyEvent } from '@/types/strategyEvent';


// 定义不同事件的类型
type EventName = 'strategy-data-update' | 'node-message-update';

// 定义缓存大小常量
const MAX_CACHE_SIZE = 20;

interface StrategyEventState {
  // 按事件名称存储的事件列表
  events: Record<EventName, StrategyEvent[]>;
  
  // 添加新事件到指定事件类型的缓存中，自动控制缓存大小
  addEvent: (eventName: EventName, event: StrategyEvent) => void;
  
  // 清空特定事件类型的所有事件
  clearEvents: (eventName: EventName) => void;
  
  // 清空所有事件
  clearAllEvents: () => void;
  
  // 获取指定事件类型的最新事件
  getLatestEvent: (eventName: EventName) => StrategyEvent | undefined;

  // 获取所有的策略事件
  getAllEvents: () => Record<EventName, StrategyEvent[]>;
}

export const useStrategyEventStore = create<StrategyEventState>((set, get) => ({
  // 初始化事件存储
  events: {
    'strategy-data-update': [],
    'node-message-update': []
  },
  
  // 添加事件到指定类型的缓存中，限制缓存大小为 MAX_CACHE_SIZE
  addEvent: (eventName, event) => set((state) => {
    const currentEvents = state.events[eventName];
    // 如果当前事件数组已达到最大容量，则移除最早的事件
    let newEvents;
    if (currentEvents.length >= MAX_CACHE_SIZE) {
      // 移除第一个元素(最旧的)，并添加新事件到末尾
      newEvents = [...currentEvents.slice(1), event];
    } else {
      // 直接添加新事件到末尾
      newEvents = [...currentEvents, event];
    }
    
    return {
      events: {
        ...state.events,
        [eventName]: newEvents
      }
    };
  }),
  
  // 清空特定事件类型的所有事件
  clearEvents: (eventName) => set((state) => ({
    events: {
      ...state.events,
      [eventName]: []
    }
  })),
  
  // 清空所有事件
  clearAllEvents: () => set({
    events: {
      'strategy-data-update': [],
      'node-message-update': []
    }
  }),
  
  // 获取指定事件类型的最新事件
  getLatestEvent: (eventName) => {
    const events = get().events[eventName];
    return events.length > 0 ? events[events.length - 1] : undefined;
  },

  // 获取所有的策略事件
  getAllEvents: () => {
    return get().events;
  },
}));
