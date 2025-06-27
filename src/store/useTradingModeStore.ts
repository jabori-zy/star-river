import { create } from 'zustand';
import { TradeMode } from '@/types/strategy';

interface TradingModeState {
  // 当前交易模式
  tradingMode: TradeMode;
  // 设置交易模式
  setTradingMode: (mode: TradeMode) => void;
}

// 创建全局状态管理
const useTradingModeStore = create<TradingModeState>((set) => ({
  // 默认为模拟交易模式
  tradingMode: TradeMode.BACKTEST,
  
  // 更新交易模式
  setTradingMode: (mode: TradeMode) => set({
    tradingMode: mode,
  }),
}));

export default useTradingModeStore; 