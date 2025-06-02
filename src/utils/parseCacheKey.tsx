import { KlineCacheKey, IndicatorCacheKey } from "../types/cache";
import { IndicatorConfig, IndicatorType } from "../types/indicator";
import { SmaConfig } from "../types/indicator/sma";

/**
 * 解析缓存键字符串为相应类型
 */
export function parseCacheKey(cacheKeyStr: string): KlineCacheKey | IndicatorCacheKey {
  const parts = cacheKeyStr.split("|");
  const type = parts[0];

  if (type === "kline") {
    return {
      exchange: parts[1],
      symbol: parts[2],
      interval: parts[3]
    } as KlineCacheKey;
  } else if (type === "indicator") {
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
      interval: parts[3],
      indicatorType: indicatorType,
      indicatorConfig: indicatorConfig
    } as IndicatorCacheKey;
  } else {
    throw new Error(`不支持的缓存键类型: ${type}`);
  }
}