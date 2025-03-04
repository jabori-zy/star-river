
import { useEffect } from "react";
import HighchartsReact from "highcharts-react-official";

//图表自适应
const useChartResize = (chartRef: React.RefObject<HighchartsReact.RefObject>) => {
    useEffect(() => {
        const handleResize = () => {
            const chart = chartRef.current?.chart; 
            if (chart) {
                chart.reflow();  
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [chartRef]);
}

export default useChartResize;