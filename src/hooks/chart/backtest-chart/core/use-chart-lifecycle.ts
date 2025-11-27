import { useEffect } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";

interface UseChartLifecycleProps {
	strategyId: number;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	isInitialized: boolean;
	setIsInitialized: (value: boolean) => void;
	initializeBacktestChart: () => void;
	chartId: number;
}

/**
 * 图表生命周期管理
 *
 * 职责：
 * 1. 数据初始化流程
 * 2. 容器引用有效性监控
 * 3. 自动检测和修复容器引用丢失
 */
export const useChartLifecycle = ({
	strategyId,
	chartContainerRef,
	isInitialized,
	setIsInitialized,
	initializeBacktestChart,
	chartId,
}: UseChartLifecycleProps): void => {
	const { getChartRef, setChartRef, initChartData } =
		useBacktestChartStore(chartId);

	/**
	 * 容器引用有效性监控
	 *
	 * 关键修复：自动检测并修复图表容器引用丢失问题
	 *
	 * 触发场景：
	 * - 添加新图表时React重新渲染，导致现有图表的DOM容器被重新创建
	 * - ResizablePanel布局变化导致DOM结构调整
	 * - 其他任何导致DOM重排的操作
	 *
	 * 检测逻辑：
	 * 1. 获取图表实例和当前容器引用
	 * 2. 通过chart.chartElement()获取图表实际绑定的DOM元素
	 * 3. 比较实际绑定的DOM元素是否仍然是当前容器的子元素
	 *
	 * 修复流程：
	 * 1. 销毁旧的图表实例（chart.remove()）
	 * 2. 清空store中的图表引用（setChartRef(null)）
	 * 3. 重置初始化状态，触发完整的重新初始化流程
	 */
	useEffect(() => {
		const chart = getChartRef();
		if (chart && chartContainerRef.current) {
			// 获取图表实际绑定的DOM容器元素
			const container = chart.chartElement();

			// 检查图表是否仍然正确绑定到当前的容器
			// 如果container不存在或者其父元素不是当前容器，说明引用已丢失
			if (!container || container.parentElement !== chartContainerRef.current) {
				// 步骤1: 销毁旧的图表实例，释放资源
				chart.remove();

				// 步骤2: 清空store中的图表引用，确保后续初始化能够正常进行
				setChartRef(null);

				// 步骤3: 重置初始化状态，触发完整的重新初始化流程
				// 这会导致useEffect重新运行initChartData和initializeBacktestChart
				setIsInitialized(false);
			}
		}
	}, [getChartRef, chartContainerRef, setChartRef, setIsInitialized]);

	/**
	 * 数据初始化
	 *
	 * 职责：
	 * 1. 获取策略播放索引
	 * 2. 获取策略时间戳
	 * 3. 初始化图表数据
	 * 4. 初始化图表实例
	 */
	useEffect(() => {
		if (isInitialized) {
			return;
		}

		let isCancelled = false;

		const initialize = async () => {
			try {
				const playIndexValue = await get_play_index(strategyId);

				// 在 initialize 函数内部调用 API
				const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
					.strategyDatetime;

				if (isCancelled) {
					return;
				}
				await initChartData(strategyDatetime, playIndexValue, strategyId);
				if (isCancelled) {
					return;
				}
				initializeBacktestChart();
			} catch (error) {
				console.error("初始化回测图表时出错:", error);
			}
		};

		initialize();

		return () => {
			isCancelled = true;
		};
	}, [strategyId, initChartData, initializeBacktestChart, isInitialized]);
};

export type { UseChartLifecycleProps };
