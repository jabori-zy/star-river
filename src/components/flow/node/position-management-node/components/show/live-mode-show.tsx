import type { PositionNodeData } from "@/types/node/position-management-node";
import { PositionHandleItem } from "../position-handle-item/index";

interface LiveModeShowProps {
	id: string;
	data: PositionNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// 获取实盘模式配置
	const liveConfig = data.liveConfig;

	// 如果没有配置或者没有仓位操作，显示提示信息
	if (
		!liveConfig ||
		!liveConfig.positionOperations ||
		liveConfig.positionOperations.length === 0
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
			{liveConfig.selectedAccount && (
				<div className="text-xs text-muted-foreground px-2">
					账户: {liveConfig.selectedAccount.accountName} (
					{liveConfig.selectedAccount.exchange})
				</div>
			)}

			{/* 渲染所有的仓位操作 */}
			{liveConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.positionOperationId}
					id={id}
					operationConfig={operationConfig}
				/>
			))}
		</div>
	);
};

export default LiveModeShow;
