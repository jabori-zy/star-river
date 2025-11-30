import type { PositionNodeData } from "@/types/node/position-node";
import { PositionHandleItem } from "../position-handle-item";
import { useTranslation } from "react-i18next";

interface BacktestModeShowProps {
	id: string;
	data: PositionNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data, handleColor }) => {
	// 获取回测模式配置
	const backtestConfig = data.backtestConfig;
	const { t } = useTranslation();
	// 如果没有配置或者没有仓位操作，显示提示信息
	if (
		!backtestConfig ||
		!backtestConfig.positionOperations ||
		backtestConfig.positionOperations.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				{t("positionNode.noPositionOperationHint")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* 渲染所有的仓位操作 */}
			{backtestConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.configId}
					id={id}
					operationConfig={operationConfig}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default BacktestModeShow;
