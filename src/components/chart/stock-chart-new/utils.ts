import {
	NumberRange,
	Rect,
	SciChartSurface,
	SciChartSubSurface,
	SciChartVerticalGroup,
	NumericAxis,
	DateTimeNumericAxis,
	XyDataSeries,
	FastLineRenderableSeries,
	ZoomPanModifier,
	MouseWheelZoomModifier,
	ZoomExtentsModifier,
	XAxisDragModifier,
	YAxisDragModifier,
	EDragMode,
	CursorModifier,
	RolloverModifier,
	TSciChart,
	EResamplingMode,
	EAutoRange,
	EAxisAlignment,
	Thickness,
} from "scichart";
import { appTheme } from "../SciChart/theme";
import { AxisSynchroniser } from "./axis-synchroniser";
import { dateValues, closeValues } from "./demo-data";

export const containerId = "containerId";

// 面板管理状态
export let panelSizes: number[] = [];
export let isDragging = false;
export let activeSplitter: HTMLElement | null = null;
export let MIN_PANEL_SIZE = 0.05;
export let parentSurface: SciChartSurface | null = null;
export let wasmContext: TSciChart | null = null;
export let verticalGroup: SciChartVerticalGroup | null = null;
export let axisSynchronizer: AxisSynchroniser | null = null;

// 状态设置函数
export function setParentSurface(surface: SciChartSurface | null) {
	parentSurface = surface;
}

export function setWasmContext(context: TSciChart | null) {
	wasmContext = context;
}

export function setVerticalGroup(group: SciChartVerticalGroup | null) {
	verticalGroup = group;
}

export function setAxisSynchronizer(synchronizer: AxisSynchroniser | null) {
	axisSynchronizer = synchronizer;
}

export function setPanelSizes(sizes: number[]) {
	panelSizes = sizes;
}

// 计算最小面板大小
export function updateMinPanelSize() {
	const container = document.getElementById(containerId);
	if (container) {
		MIN_PANEL_SIZE = 100 / container.offsetHeight;
	}
}

// 动态创建子图容器
export function createSubChartContainer(id: string) {
	const container = document.createElement("div");
	container.id = id;
	container.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
    `;
	return container;
}

// 动态创建splitter
export function createSplitter(id: string, position: number) {
	const splitter = document.createElement("div");
	splitter.id = id;
	splitter.className = "chart-splitter";
	splitter.style.cssText = `
        width: 100%;
        height: 6px;
        background-color: #2B2D70;
        cursor: row-resize;
        position: absolute;
        z-index: 1;
        top: ${position * 100}%;
    `;

	// 添加实线
	const innerDiv = document.createElement("div");
	innerDiv.style.cssText = `
        height: 4px;
        width: 100%;
        border-bottom: 2px solid gray;
    `;
	splitter.appendChild(innerDiv);

	return splitter;
}

// 更新图表位置
export function updateChartPositions() {
	if (!parentSurface) return;

	let currentY = 0;
	for (let i = 0; i < panelSizes.length; i++) {
		const chart = parentSurface.subCharts[i];
		if (chart) {
			chart.subPosition = new Rect(0, currentY, 1, panelSizes[i]);
			currentY += panelSizes[i];
		}
	}
}

// 更新splitter位置
export function updateSplitterPositions() {
	const splitters = Array.from(
		document.querySelectorAll(".chart-splitter"),
	) as HTMLElement[];
	let currentY = 0;
	splitters.forEach((splitter: HTMLElement, index) => {
		currentY += panelSizes[index];
		splitter.style.top = `${currentY * 100}%`;
	});
}

// 设置splitter事件
export function setupSplitterEvents(
	splitter: HTMLElement,
	splitterIndex: number,
) {
	splitter.addEventListener("pointerdown", (e) => {
		isDragging = true;
		activeSplitter = splitter;
		splitter.setPointerCapture((e as PointerEvent).pointerId);
		document.body.style.userSelect = "none";
	});

	document.addEventListener("pointermove", (e) => {
		if (!isDragging || !activeSplitter) return;

		const container = document.getElementById(containerId);
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const mouseY = (e.clientY - rect.top) / rect.height;

		// 计算允许的位置范围
		const minY =
			splitterIndex > 0 ? MIN_PANEL_SIZE * (splitterIndex + 1) : MIN_PANEL_SIZE;
		const maxY = 1 - MIN_PANEL_SIZE * (panelSizes.length - splitterIndex - 1);

		if (mouseY >= minY && mouseY <= maxY) {
			// 调整相邻的两个面板
			const upperPanelIndex = splitterIndex;
			const lowerPanelIndex = splitterIndex + 1;

			const totalAffectedSize =
				panelSizes[upperPanelIndex] + panelSizes[lowerPanelIndex];
			const upperPanelStart =
				upperPanelIndex > 0
					? panelSizes.slice(0, upperPanelIndex).reduce((a, b) => a + b, 0)
					: 0;

			const newUpperSize = mouseY - upperPanelStart;
			const newLowerSize = totalAffectedSize - newUpperSize;

			// 检查最小尺寸
			const containerHeight = container.offsetHeight;
			if (
				newUpperSize * containerHeight < 100 ||
				newLowerSize * containerHeight < 100
			) {
				return;
			}

			panelSizes[upperPanelIndex] = newUpperSize;
			panelSizes[lowerPanelIndex] = newLowerSize;

			updateChartPositions();
			updateSplitterPositions();
			updateCloseButtons();
		}
	});

	document.addEventListener("pointerup", (e) => {
		if (isDragging) {
			isDragging = false;
			activeSplitter = null;
			if (splitter) {
				splitter.releasePointerCapture((e as PointerEvent).pointerId);
			}
			document.body.style.userSelect = "";
		}
	});
}

// 添加关闭按钮
export function addCloseButton(chartIndex: number) {
	if (!parentSurface || parentSurface.subCharts.length <= 1) return;

	const closeBtn = document.createElement("button");
	closeBtn.className = "chart-close-button";
	closeBtn.innerHTML = "×";
	closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        border: none;
        background-color: rgba(255, 255, 255, 0.8);
        color: #333;
        cursor: pointer;
        border-radius: 50%;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    `;
	closeBtn.dataset.chartIndex = chartIndex.toString();

	closeBtn.onclick = (e) => {
		e.stopPropagation();
		removeChart(chartIndex);
	};

	document.getElementById(containerId)?.appendChild(closeBtn);

	// 计算按钮位置
	const yPos = panelSizes.slice(0, chartIndex).reduce((a, b) => a + b, 0);
	closeBtn.style.top = `calc(${yPos * 100}% + 10px)`;
}

// 更新关闭按钮位置
export function updateCloseButtons() {
	// 移除所有现有按钮
	document
		.querySelectorAll(".chart-close-button")
		.forEach((btn) => btn.remove());

	// 如果有多个图表，重新添加按钮
	if (parentSurface && parentSurface.subCharts.length > 1) {
		parentSurface.subCharts.forEach((_: SciChartSubSurface, index: number) => {
			addCloseButton(index);
		});
	}
}

// 删除图表
export function removeChart(index: number) {
	if (!parentSurface || parentSurface.subCharts.length <= 1) return;

	const chartToRemove = parentSurface.subCharts[index];

	// 从轴同步器移除
	if (axisSynchronizer) {
		const xAxis = chartToRemove.xAxes.get(0);
		if (xAxis) {
			axisSynchronizer.removeAxis(xAxis);
		}
	}

	// 简化垂直组移除逻辑
	if (verticalGroup && chartToRemove) {
		// 重新创建垂直组，这是最安全的方式
		verticalGroup = new SciChartVerticalGroup();
	}

	// 移除图表
	parentSurface.removeSubChart(chartToRemove);
	panelSizes.splice(index, 1);

	// 移除对应的容器
	const containerId = `subChartWrapper${index + 1}`;
	document.getElementById(containerId)?.remove();

	// 移除对应的splitter
	const splitters = Array.from(document.querySelectorAll(".chart-splitter"));
	if (index > 0) {
		splitters[index - 1]?.remove();
	} else if (splitters.length > 0) {
		splitters[0]?.remove();
	}

	// 标准化剩余面板尺寸
	const totalSize = panelSizes.reduce((a, b) => a + b, 0);
	panelSizes = panelSizes.map((size) => size / totalSize);

	// 重新添加剩余图表到垂直组
	if (verticalGroup) {
		parentSurface.subCharts.forEach((chart) => {
			verticalGroup!.addSurfaceToGroup(chart);
		});
	}

	// 更新位置
	updateChartPositions();
	updateSplitterPositions();
	updateCloseButtons();
}

// 添加新图表
export function addSubChart() {
	if (!parentSurface || !wasmContext) return;

	const chartCount = parentSurface.subCharts?.length ?? 0;
	const newChartId = `subChart${chartCount + 1}`;
	const newContainerId = `subChartWrapper${chartCount + 1}`;

	// 计算新的面板尺寸
	if (panelSizes.length === 0) {
		panelSizes.push(1);
	} else {
		const newSize = 1 / (chartCount + 1);
		panelSizes = panelSizes.map(
			(size) => size * (chartCount / (chartCount + 1)),
		);
		panelSizes.push(newSize);
	}

	// 创建子图容器
	const container = document.getElementById(containerId);
	if (container) {
		const subContainer = createSubChartContainer(newContainerId);
		container.appendChild(subContainer);
	}

	// 添加子图 - 使用简化的配置
	const newChart = parentSurface.addSubChart({
		position: new Rect(0, 0, 1, panelSizes[chartCount]),
		id: newChartId,
		subChartContainerId: newContainerId,
		subChartPadding: Thickness.fromNumber(10),
		isTransparent: false,
		theme: appTheme.SciChartJsTheme,
	});

	// 手动添加轴
	const xAxis = new DateTimeNumericAxis(wasmContext, {
		drawLabels: chartCount === panelSizes.length - 1, // 只有最后一个图表显示标签
		autoRange: EAutoRange.Once,
		useNativeText: false,
		minorsPerMajor: 3,
		drawMajorBands: false,
		drawMajorGridLines: false,
		drawMinorGridLines: false,
	});
	newChart.xAxes.add(xAxis);

	const yAxis = new NumericAxis(wasmContext, {
		maxAutoTicks: 6,
		autoRange: EAutoRange.Always,
		growBy: new NumberRange(0.1, 0.1),
		axisAlignment: EAxisAlignment.Right,
		labelPrecision: 2,
		drawMinorGridLines: false,
		drawMajorGridLines: false,
	});
	newChart.yAxes.add(yAxis);

	// 添加系列
	const dataSeries = new XyDataSeries(wasmContext, {
		dataSeriesName: `Chart ${chartCount + 1}`,
	});
	dataSeries.appendRange(dateValues, closeValues);

	const lineSeries = new FastLineRenderableSeries(wasmContext, {
		stroke: appTheme.VividSkyBlue,
		strokeThickness: 2,
		dataSeries,
		resamplingMode: EResamplingMode.Auto,
	});
	newChart.renderableSeries.add(lineSeries);

	newChart.chartModifiers.add(
		new XAxisDragModifier(),
		new YAxisDragModifier({
			dragMode: EDragMode.Scaling,
		}),
		new ZoomExtentsModifier(),
		new ZoomPanModifier({ enableZoom: true }),
		new MouseWheelZoomModifier(),
		new CursorModifier({
			crosshairStroke: appTheme.Gray,
			axisLabelFill: appTheme.Black,
			crosshairStrokeThickness: 0.5,
		}),
		new RolloverModifier({
			modifierGroup: "cursorGroup",
			showTooltip: false,
		}),
	);

	// 添加到垂直组
	if (verticalGroup) {
		verticalGroup.addSurfaceToGroup(newChart);
	}

	// 同步X轴 - 使用AxisSynchroniser
	if (axisSynchronizer) {
		axisSynchronizer.addAxis(xAxis);
	}

	// 添加splitter（如果不是第一个图表）
	if (chartCount > 0) {
		const splitterPosition = panelSizes
			.slice(0, chartCount)
			.reduce((a, b) => a + b, 0);
		const splitter = createSplitter(
			`splitter${chartCount - 1}`,
			splitterPosition,
		);
		container?.appendChild(splitter);
		setupSplitterEvents(splitter, chartCount - 1);
	}

	// 更新位置
	updateChartPositions();
	updateSplitterPositions();
	updateCloseButtons();

	return newChart;
}
