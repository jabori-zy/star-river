import { useRef } from "react";
import { SciChartReact, type TResolvedReturnType } from "scichart-react";
import { initStockChart } from "./init-stock-chart-new";
import { containerId } from "./utils";

const StockChart = () => {
	const chartControlsRef = useRef<
		| {
				addSubChart: () => void;
				removeChart: (index: number) => void;
		  }
		| undefined
	>(undefined);

	return (
		<div className="flex flex-col w-full h-full">
			{/* 外部控制按钮 */}
			<div className="flex gap-2 p-2 border-b">
				<button
					onClick={() => chartControlsRef.current?.addSubChart()}
					className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
				>
					添加图表
				</button>
				<div className="text-sm text-gray-500 flex items-center">
					点击图表右上角的 × 按钮删除图表
				</div>
			</div>

			{/* 图表容器 */}
			<div
				id={containerId}
				className="flex-1"
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					touchAction: "none",
				}}
			>
				<SciChartReact
					initChart={initStockChart}
					onInit={(initResult: TResolvedReturnType<typeof initStockChart>) => {
						const { addSubChart, removeChart } = initResult;
						chartControlsRef.current = { addSubChart, removeChart };
					}}
					style={{
						minWidth: "100%",
						maxWidth: "100%",
						width: "100%",
						minHeight: "100%",
						maxHeight: "100%",
						height: "100%",
					}}
				/>
			</div>
		</div>
	);
};

export default StockChart;
