import * as Highcharts from "highcharts/highstock";
import { HighchartsReact } from "highcharts-react-official";
import { useRef, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import useChartResize from "@/hooks/use-chartResize";



const exampleData = [
    [1736844188000, 95675.74],
    [1736844189000, 95675.74],
    [1736844190000, 95677.68],
    [1736844191000, 95685.31],
    [1736844192000, 95686.72],
    [1736844193000, 95686.73],
    [1736844194000, 95686.72],
    [1736844195000, 95686.72],
    [1736844196000, 95686.72],
    [1736844197000, 95686.72]
]


//图表配置
const options: Highcharts.Options = {
    // responsive: {
    //     rules: [{
    //         condition: {
    //             maxWidth: 200
    //         },
    //         chartOptions: {
    //             legend: {
    //                 enabled: false
    //             }
    //         }
    //     }]
    // },
    chart: {
        reflow: true,
        
    },

    time: {
        timezone: 'Asia/Shanghai'
    },
    rangeSelector: {
        enabled: true,
        selected: 1,
    },
    navigator:{
        enabled: true,
        height: 30,
        margin: 10,
        series: {
            color: '#A6C5F7',      // 导航器中图表的颜色
            fillOpacity: 0.5,      // 填充透明度
            lineWidth: 1           // 线条宽度
        },
    },
    title: {
        text: '折线图示例'
    },
    xAxis: {
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
        data: exampleData,
        type: 'line',
        name: 'BTC Price',
        id: 'btc'
    }]
}

function LineChart(props: HighchartsReact.Props) {

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [_, setBtcPrice] = useState({});

  useEffect(() => {
    //监听btc价格
    const btcPriceListener = listen("btc_price", (event) => {
        const data = event.payload as {price: number, timestamp: number};
        setBtcPrice(data);

        const chart = chartComponentRef.current?.chart;

        if (chart) {
            const series = chart.series[0];
            if (series) {
                series.addPoint([data.timestamp*1000, data.price], true, false);
            }
        }
    });
    
    return () => {
        btcPriceListener.then(fn => fn());
    };
  }, []);

  useChartResize(chartComponentRef);

  return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={options}
            ref={chartComponentRef}
            {...props}
        />
  );
}

export default LineChart;
