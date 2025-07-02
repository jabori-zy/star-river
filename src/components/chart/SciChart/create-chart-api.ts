import { 
    SciChartVerticalGroup,
    NumberRange,
} from "scichart";
import { initKlineChart } from "./kline-chart/init-kline-chart";
import initTestChart from "./test-chart/init-test-chart";

export const createChartApi = (rootElement: string | HTMLDivElement) => {
    // 使用group，将所有图表组合在一起
    const verticalGroup = new SciChartVerticalGroup();

    const initKlineChartFunc = initKlineChart(rootElement, verticalGroup);
    const initTestChartFunc = initTestChart(rootElement, verticalGroup);


    return {
        initKlineChartFunc,
        initTestChartFunc,
        verticalGroup,
    }
}