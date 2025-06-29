export type LayoutMode = "vertical" | "horizontal";

export type BacktestChart = {
    id: number;
    chartName: string;
    klineCacheKeyStr: string;
    indicatorCacheKeyStrs: string[];
}

export type BacktestStrategyChartConfig = {
    charts: BacktestChart[];
    layout: LayoutMode | null;
}