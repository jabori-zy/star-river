import { useEffect, useState } from "react";
import * as Highcharts from "highcharts/highstock";
import { HighchartsReact } from "highcharts-react-official";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import useChartResize from "@/hooks/use-chartResize";


interface KlineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


const options: Highcharts.Options = {
  time: {
    timezone: 'Asia/Shanghai'
  },
  rangeSelector: {
    selected: 1
  },
  title: {
    text: 'K线图示例'
  },
  xAxis: {
    overscroll: 500000,
    range: 4 * 200000,
    type: 'datetime',
        dateTimeLabelFormats: {
            day: '%Y-%m-%d %H:%M:%S',
            week: '%Y-%m-%d %H:%M:%S',
            month: '%Y-%m-%d %H:%M:%S',
            year: '%Y-%m-%d %H:%M:%S'
        },
  },
  yAxis: {
    title: {
      text: '价格'
    }
  },
  tooltip:{
    valueDecimals: 2,
        xDateFormat: '%Y-%m-%d %H:%M:%S',
        shared: false,
        formatter: function() {
            const date = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x + 8*60*60*1000);
            return `${date}<br/>BTC价格:${this.y}`;
        }
    
  },
  accessibility: {
    enabled: false
  },
  series: [{
    data: [[]],
    type: 'candlestick',
    lastPrice: {
      enabled: true,
      label: {
          enabled: true,
          backgroundColor: '#FF7F7F'
      },
    },
    name: 'BTC Price',
    id: 'btc_price'
  }]
}


function KlineChart(props: HighchartsReact.Props) {

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [kline, setKline] = useState({});
  const [httpKline, setHttpKline] = useState<Array<KlineData>>([]);

  useEffect(() => {
    //监听btc价格
    const klineListener = listen("kline-update", (event) => {
        const data = event.payload as {open_time: number, open: number, high: number, low: number, close: number, volume: number};
        setKline(data);
        const chart = chartComponentRef.current?.chart;
        if (chart) {
            const series = chart.series[0];
            if (series) {
              // 如果series没有数据，则添加数据
              if (series.points.length === 0) {
                series.addPoint([data.open_time, data.open, data.high, data.low, data.close], true, false);
                
              } else {
                // 判断当前开盘时间是否一样
                const lastPoint = series.points[series.points.length - 1];
                const lastPointOpenTime = lastPoint.x;
                // 如果当前时间与上一个时间相同，则更新数据
                if (lastPointOpenTime === data.open_time) {
                  lastPoint.update([data.open_time, data.open, data.high, data.low, data.close], true, false);
                } else {
                  // 如果当前时间与上一个时间不同，则添加数据
                  series.addPoint([data.open_time, data.open, data.high, data.low, data.close], true, false);
                }
              }

              // console.log("series_data", series.points)
            }
        }
    });
    
    return () => {
        klineListener.then(fn => fn());
    };
  }, []);

  const get_http_kline = async () => {
    const data = await invoke<Array<KlineData>>("get_http_kline");
    console.log("data", data);
    const result = data.map(item => [
      item.timestamp,
      item.open,
      item.high,
      item.low,
      item.close,
      item.volume,
    ]);
    // console.log("result", result);
    // setHttpKline(result);
    // console.log("httpKline", data);

    const chart = chartComponentRef.current?.chart;
    if (chart) {
      const series = chart.series[0];
      if (series) {
        series.setData(result);
      }
    }
  }

  useChartResize(chartComponentRef);


  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={options}
            ref={chartComponentRef}
            {...props}
        />
        <Button onClick={get_http_kline}>获取K线</Button>
    </div>

  );
}

export default KlineChart;
