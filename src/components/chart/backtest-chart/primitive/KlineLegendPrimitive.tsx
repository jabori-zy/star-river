import { memo, useCallback } from "react";
import type { ISeriesApi } from "lightweight-charts";
import { SeriesPrimitive } from "lightweight-charts-react-components";
import type { RenderPrimitive } from "lightweight-charts-react-components";
import { KlineLegend, type KlineLegendOptions } from "./KlineLegend";

type KlineLegendPrimitiveProps = {
  series?: ISeriesApi<"Candlestick">;
  options?: Partial<KlineLegendOptions>;
};

const KlineLegendPrimitive = ({ series, options }: KlineLegendPrimitiveProps) => {
  const renderKlineLegend: RenderPrimitive = useCallback(
    ({ chart, series: seriesFromContext }) => {
      const targetSeries = series || seriesFromContext;
      
      if (!targetSeries) {
        console.warn("KlineLegendPrimitive: No series provided");
        return null;
      }

      return new KlineLegend({ 
        chart, 
        series: targetSeries as ISeriesApi<"Candlestick">, 
        options 
      });
    },
    [series, options]
  );

  return <SeriesPrimitive render={renderKlineLegend} />;
};

const MemoizedKlineLegendPrimitive = memo(KlineLegendPrimitive);

export { MemoizedKlineLegendPrimitive as KlineLegendPrimitive };
