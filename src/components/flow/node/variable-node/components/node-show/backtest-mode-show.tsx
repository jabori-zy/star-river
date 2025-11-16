import type React from "react";
import type { VariableNodeData } from "@/types/node/variable-node";
import { VariableHandleItem } from "../variable-handle-item/index";

interface BacktestModeShowProps {
	id: string;
	data: VariableNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data, handleColor }) => {
	// 获取回测模式配置
	const backtestConfig = data.backtestConfig;

	// 如果没有配置或者没有变量配置，显示提示信息
	if (
		!backtestConfig ||
		!backtestConfig.variableConfigs ||
		backtestConfig.variableConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无变量配置
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* 渲染所有的变量配置 */}
			{backtestConfig.variableConfigs.map((variableConfig) => (
				<VariableHandleItem
					key={variableConfig.configId}
					id={id}
					variableConfig={variableConfig}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default BacktestModeShow;
