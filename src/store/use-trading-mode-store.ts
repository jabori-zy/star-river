import { create } from "zustand";
import { TradeMode } from "@/types/strategy";

interface TradingModeState {
	// Current trading mode
	tradingMode: TradeMode;
	// Set trading mode
	setTradingMode: (mode: TradeMode) => void;
}

// Create global state management
const useTradingModeStore = create<TradingModeState>((set) => ({
	// Default to backtest trading mode
	tradingMode: TradeMode.BACKTEST,

	// Update trading mode
	setTradingMode: (mode: TradeMode) =>
		set({
			tradingMode: mode,
		}),
}));

export default useTradingModeStore;
