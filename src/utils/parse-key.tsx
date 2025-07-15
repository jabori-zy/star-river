import { Key, KlineKey, IndicatorKey, BacktestKlineKey, BacktestIndicatorKey } from "../types/symbol-key";
import { IndicatorConfig, IndicatorType } from "../types/indicator";
import { SmaConfig } from "@/types/indicator/indicatorConfig";
import { KlineInterval } from "@/types/kline";

/**
 * 解析缓存键字符串为相应类型
 */
export function parseKey(keyStr: string): Key {
  const parts = keyStr.split("|");
  const type = parts[0];

  if (type === "kline") {
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval
    } as KlineKey;
  } 
  
  else if (type === "indicator") {
    // 处理指标配置参数
    const indicatorConfigStr = parts[4]; // 如 "sma(period=9)"
    const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;
    
    let indicatorConfig: IndicatorConfig;
    
    if (indicatorType === IndicatorType.SMA) {
      // 解析SMA配置
      const paramStr = indicatorConfigStr.match(/\((.*?)\)/)?.[1] || "";
      const params = new Map<string, string>();
      
      paramStr.split(",").forEach(param => {
        const [key, value] = param.split("=");
        params.set(key, value);
      });
      
      indicatorConfig = {
        period: parseInt(params.get("period") || "0")
      } as SmaConfig;
    } else {
      throw new Error(`不支持的指标类型: ${indicatorType}`);
    }
    
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval,
      indicatorType: indicatorType,
      indicatorConfig: indicatorConfig
    } as IndicatorKey;
  } 
  else if (type === "backtest_kline") {
    // backtest_kline|metatrader5(Exness-MT5Trial5)|BTCUSDm|15m|2025-06-22|2025-06-24

    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval,
      startTime: parts[4],
      endTime: parts[5]
    } as BacktestKlineKey;
  }

  else if (type === "backtest_indicator") {
    // backtest_indicator|metatrader5(Exness-MT5Trial5)|BTCUSDm|15m|sma(period=9)|2025-06-22|2025-06-24
    // 处理指标配置参数
    const indicatorConfigStr = parts[4]; // 如 "sma(period=9)"
    const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;
    
    let indicatorConfig: IndicatorConfig;
    
    if (indicatorType === IndicatorType.SMA) {
      // 解析SMA配置
      const paramStr = indicatorConfigStr.match(/\((.*?)\)/)?.[1] || "";
      const params = new Map<string, string>();
      
      paramStr.split(",").forEach(param => {
        const [key, value] = param.split("=");
        params.set(key, value);
      });
      
      indicatorConfig = {
        period: parseInt(params.get("period") || "0")
      } as SmaConfig;
    } else {
      throw new Error(`不支持的指标类型: ${indicatorType}`);
    }
    
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval,
      indicatorType: indicatorType,
      indicatorConfig: indicatorConfig,
      startTime: parts[5],
      endTime: parts[6]
    } as BacktestIndicatorKey;
    
  }
  
  else {
    throw new Error(`不支持的缓存键类型: ${type}`);
  }
}