/* eslint-disable react-hooks/rules-of-hooks */
// This file contains Canvas rendering code, not React components
// The useBitmapCoordinateSpace method is from Canvas API, not React Hooks
import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  CandlestickData,
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  ISeriesApi,
  MouseEventParams,
  SeriesAttachedParameter,
  Time,
} from "lightweight-charts";

type KlineLegendOptions = {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  padding: number;
  borderRadius: number;
  opacity: number;
  position: {
    top: number;
    left: number;
  };
  hoverBackgroundColor: string;
  valueColor: string;
  upColor: string;
  downColor: string;
};

type KlineLegendParams = {
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  options?: Partial<KlineLegendOptions>;
};

type KlineLegendData = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: Time;
  change: number;
  changePercent: number;
  color: string;
};

const defaultKlineLegendOptions: KlineLegendOptions = {
  backgroundColor: "rgba(255, 255, 255, 0.0)", // 透明背景，模拟原有样式
  textColor: "#000000",
  fontSize: 12,
  padding: 8,
  borderRadius: 4,
  opacity: 1.0,
  position: {
    top: 10,
    left: 10,
  },
  hoverBackgroundColor: "rgba(243, 244, 246, 0.8)", // hover:bg-gray-100
  valueColor: "#000000", // 默认值颜色
  upColor: "#22c55e", // 涨的颜色
  downColor: "#ef4444", // 跌的颜色
};

class KlineLegendRenderer implements IPrimitivePaneRenderer {
  private _data: KlineLegendData | null = null;
  private _options: KlineLegendOptions;
  private _isHovered: boolean = false;

  constructor(options: KlineLegendOptions) {
    this._options = options;
  }

  setData(data: KlineLegendData | null) {
    this._data = data;
  }

  setHovered(hovered: boolean) {
    this._isHovered = hovered;
  }

  draw(target: CanvasRenderingTarget2D) {
    if (!this._data) return;
    this._renderInBitmapSpace(target, this._data);
  }

  private _renderInBitmapSpace(target: CanvasRenderingTarget2D, data: KlineLegendData) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const { textColor, fontSize, padding, position, upColor, downColor } = this._options;
      
      // 设置字体
      ctx.font = `${fontSize * scope.verticalPixelRatio}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // 准备文本内容 - 模拟原有的横向布局
      const segments = [
        { label: "O: ", value: data.open.toFixed(2), color: data.color },
        { label: "H: ", value: data.high.toFixed(2), color: data.color },
        { label: "L: ", value: data.low.toFixed(2), color: data.color },
        { label: "C: ", value: data.close.toFixed(2), color: data.color },
        { 
          label: "", 
          value: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`,
          color: data.change >= 0 ? upColor : downColor 
        }
      ];

      // 计算每个段的宽度
      let currentX = position.left * scope.horizontalPixelRatio + padding * scope.horizontalPixelRatio;
      const y = position.top * scope.verticalPixelRatio + padding * scope.verticalPixelRatio;
      const lineHeight = fontSize * scope.verticalPixelRatio * 1.2;
      const segmentGap = 16 * scope.horizontalPixelRatio; // gap-2 的间距

      // 计算总宽度用于背景
      let totalWidth = 0;
      segments.forEach((segment, index) => {
        const labelWidth = ctx.measureText(segment.label).width;
        const valueWidth = ctx.measureText(segment.value).width;
        totalWidth += labelWidth + valueWidth;
        if (index < segments.length - 1) {
          totalWidth += segmentGap;
        }
      });

      // 绘制背景（如果悬浮）
      if (this._isHovered) {
        const bgPadding = padding * scope.horizontalPixelRatio;
        const bgX = position.left * scope.horizontalPixelRatio;
        const bgY = position.top * scope.verticalPixelRatio;
        const bgWidth = totalWidth + bgPadding * 2;
        const bgHeight = lineHeight + bgPadding * 2;

        ctx.save();
        ctx.fillStyle = this._options.hoverBackgroundColor;
        
        if (this._options.borderRadius > 0) {
          const radius = this._options.borderRadius * scope.horizontalPixelRatio;
          ctx.beginPath();
          ctx.moveTo(bgX + radius, bgY);
          ctx.lineTo(bgX + bgWidth - radius, bgY);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
          ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
          ctx.lineTo(bgX + radius, bgY + bgHeight);
          ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
          ctx.lineTo(bgX, bgY + radius);
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        }
        
        ctx.restore();
      }

      // 绘制文本
      segments.forEach((segment, index) => {
        // 绘制标签
        ctx.fillStyle = textColor;
        ctx.fillText(segment.label, currentX, y);
        currentX += ctx.measureText(segment.label).width;

        // 绘制值
        ctx.fillStyle = segment.color;
        ctx.fillText(segment.value, currentX, y);
        currentX += ctx.measureText(segment.value).width;

        // 添加间距（除了最后一个）
        if (index < segments.length - 1) {
          currentX += segmentGap;
        }
      });
    });
  }
}

class KlineLegendPaneView implements IPrimitivePaneView {
  private _renderer: KlineLegendRenderer;

  constructor(private _primitive: KlineLegend) {
    this._renderer = new KlineLegendRenderer(this._primitive.options);
  }

  renderer() {
    return this._renderer;
  }

  update() {
    this._renderer.setData(this._primitive.getCurrentData());
    this._renderer.setHovered(this._primitive.isHovered());
  }

  zOrder(): "bottom" | "normal" | "top" {
    return "top";
  }
}

class KlineLegend implements ISeriesPrimitive<Time> {
  private _paneViews: KlineLegendPaneView[];
  private _currentData: KlineLegendData | null = null;
  private _chart: IChartApi;
  private _series: ISeriesApi<"Candlestick">;
  private _options: KlineLegendOptions;
  private _requestUpdate?: () => void;
  private _isHovered: boolean = false;

  constructor({ chart, series, options }: KlineLegendParams) {
    this._chart = chart;
    this._series = series;
    this._options = { ...defaultKlineLegendOptions, ...options };
    this._paneViews = [new KlineLegendPaneView(this)];
  }

  get options(): KlineLegendOptions {
    return this._options;
  }

  getCurrentData(): KlineLegendData | null {
    return this._currentData;
  }

  isHovered(): boolean {
    return this._isHovered;
  }

  private _updateData(data: CandlestickData<Time> | null) {
    if (!data) {
      this._currentData = null;
      return;
    }

    const change = data.close - data.open;
    const changePercent = (change / data.open) * 100;
    const isUp = data.close >= data.open;

    this._currentData = {
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      time: data.time,
      change,
      changePercent,
      color: isUp ? this._options.upColor : this._options.downColor,
    };
  }

  private _onCrosshairMove = (param: MouseEventParams) => {
    if (!param.time) {
      const lastData = this._series.dataByIndex(Number.MAX_SAFE_INTEGER, -1);
      this._updateData(lastData as CandlestickData<Time> | null);
    } else {
      const data = param.seriesData.get(this._series) as CandlestickData<Time> | undefined;
      this._updateData(data || null);
    }
    
    this._requestUpdate?.();
  };

  attached(param: SeriesAttachedParameter<Time>) {
    this._requestUpdate = param.requestUpdate;
    
    this._chart.subscribeCrosshairMove(this._onCrosshairMove);
    
    const lastData = this._series.dataByIndex(Number.MAX_SAFE_INTEGER, -1);
    this._updateData(lastData as CandlestickData<Time> | null);
    this._requestUpdate();
  }

  detached() {
    this._chart.unsubscribeCrosshairMove(this._onCrosshairMove);
    this._requestUpdate = undefined;
  }

  updateAllViews(): void {
    this._paneViews.forEach(view => view.update());
  }

  paneViews() {
    return this._paneViews;
  }
}

export { KlineLegend, type KlineLegendOptions };
