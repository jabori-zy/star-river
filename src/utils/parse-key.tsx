import { Key, KlineKey, IndicatorKey, BacktestKlineKey, BacktestIndicatorKey } from "../types/symbol-key";
import { IndicatorType } from "../types/indicator";
import { parseIndicatorConfig } from "@/types/indicator/indicator-config-parser";
import { KlineInterval } from "@/types/kline";

/**
 * 解析缓存键字符串为相应类型
 */
export function parseKey(keyStr: string): Key {
  const parts = keyStr.split("|");
  const type = parts[0];
  console.log("key_type", type);

  if (type === "kline") {
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval
    } as KlineKey;
  } 
  
  else if (type === "indicator") {
    const indicatorConfigStr = parts[4];
    const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;
    console.log(indicatorType);
    
    const indicatorConfig = parseIndicatorConfig(indicatorConfigStr);
    console.log(indicatorConfig);
    
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval,
      indicatorType: indicatorType,
      indicatorConfig: indicatorConfig
    } as IndicatorKey;
  } 
  
  else if (type === "backtest_kline") {
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3] as unknown as KlineInterval,
      startTime: parts[4],
      endTime: parts[5]
    } as BacktestKlineKey;
  }

  else if (type === "backtest_indicator") {
    const indicatorConfigStr = parts[4];
    const indicatorType = indicatorConfigStr.split("(")[0] as IndicatorType;
    
    const indicatorConfig = parseIndicatorConfig(indicatorConfigStr);
    console.log("indicatorConfig", indicatorConfig);
    
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