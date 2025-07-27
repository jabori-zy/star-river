import {
	DateTimeNumericAxis,
	NumberRange,
	NumericAxis,
	SciChartSurface,
	SciChartVerticalGroup,
} from "scichart";
import { appTheme } from "../SciChart/theme";
import { AxisSynchroniser } from "./axis-synchroniser";
import { dateValues } from "./demo-data";
import {
	addSubChart,
	removeChart,
	setAxisSynchronizer,
	setParentSurface,
	setVerticalGroup,
	setWasmContext,
	updateMinPanelSize,
} from "./utils";

export const initStockChart = async (rootElement: string | HTMLDivElement) => {
	const verticalGroup = new SciChartVerticalGroup();

	// 创建轴同步器
	const axisSynchronizer = new AxisSynchroniser(
		new NumberRange(0, dateValues.length - 1),
	);

	// 使用传统方式创建图表
	const { wasmContext: wasm, sciChartSurface } = await SciChartSurface.create(
		rootElement,
		{
			theme: appTheme.SciChartJsTheme,
		},
	);

	// 手动添加不可见的轴
	const xAxis = new DateTimeNumericAxis(wasm, {
		isVisible: false,
	});
	sciChartSurface.xAxes.add(xAxis);

	const yAxis = new NumericAxis(wasm, {
		isVisible: false,
	});
	sciChartSurface.yAxes.add(yAxis);

	// 设置全局状态
	setParentSurface(sciChartSurface);
	setWasmContext(wasm);
	setVerticalGroup(verticalGroup);
	setAxisSynchronizer(axisSynchronizer);

	// 初始化最小面板大小
	updateMinPanelSize();

	// 监听窗口大小变化
	window.addEventListener("resize", updateMinPanelSize);

	// 创建初始图表（两个图表）
	addSubChart();
	addSubChart();

	return {
		sciChartSurface,
		wasmContext: wasm,
		addSubChart,
		removeChart,
	};
};
