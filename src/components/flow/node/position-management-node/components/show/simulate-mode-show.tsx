import type { PositionNodeData } from "@/types/node/position-management-node";
import { PositionHandleItem } from "../position-handle-item/index";

interface SimulateModeShowProps {
	id: string;
	data: PositionNodeData;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({ id, data }) => {
	// 获取模拟模式配置
	const simulateConfig = data.simulateConfig;

	// 如果没有配置或者没有仓位操作，显示提示信息
	if (
		!simulateConfig ||
		!simulateConfig.positionOperations ||
		simulateConfig.positionOperations.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无仓位操作配置
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* 显示账户信息 */}
			{simulateConfig.selectedAccount && (
				<div className="text-xs text-muted-foreground px-2">
					账户: {simulateConfig.selectedAccount.accountName} (
					{simulateConfig.selectedAccount.exchange})
				</div>
			)}

			{/* 渲染所有的仓位操作 */}
			{simulateConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.positionOperationId}
					id={id}
					operationConfig={operationConfig}
				/>
			))}
		</div>
	);
};

export default SimulateModeShow;
