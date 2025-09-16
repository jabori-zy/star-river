import { useNodeConnections } from "@xyflow/react";
import { Activity, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUpdateLiveConfig } from "@/hooks/node-config/indicator-node/use-update-live-config";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import { TradeMode } from "@/types/strategy";

const IndicatorNodeSimSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
	const indicatorNodeData = data as IndicatorNodeData;
	const connections = useNodeConnections({ id });
	const [isConnected, setIsConnected] = useState(false);

	// 使用自定义hook管理指标配置
	const { simulateConfig, updateConfigFromConnection } = useUpdateLiveConfig({
		id,
		initialSimulateConfig: indicatorNodeData.simulateConfig,
	});

	useEffect(() => {
		const hasConnection = connections.length === 1;
		setIsConnected(hasConnection);

		if (hasConnection) {
			// 当连接建立时，从kline节点更新配置
			updateConfigFromConnection(TradeMode.SIMULATE);
		}
	}, [connections, updateConfigFromConnection]);

	return (
		<div className="space-y-4">
			{/* 连接状态显示 */}
			<div className="space-y-2">
				<Label className="flex items-center gap-2">
					<Activity className="h-4 w-4 text-muted-foreground" />
					连接状态
				</Label>
				{isConnected ? (
					<Badge variant="secondary" className="bg-green-100 text-green-800">
						已连接到K线节点
					</Badge>
				) : (
					<Badge variant="destructive">未连接</Badge>
				)}
			</div>

			{/* 配置信息显示 */}
			{simulateConfig && isConnected ? (
				<div className="space-y-3">
					<Label className="text-sm font-medium">从K线节点获取的配置信息</Label>

					{/* 交易所信息 */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<span className="text-sm text-muted-foreground">交易所:</span>
						<span className="text-sm font-medium">
							{simulateConfig.exchange || "未配置"}
						</span>
					</div>

					{/* 交易对信息 */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<span className="text-sm text-muted-foreground">交易对:</span>
						<span className="text-sm font-medium">
							{simulateConfig.symbol || "未配置"}
						</span>
					</div>

					{/* 时间周期信息 */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<span className="text-sm text-muted-foreground">时间周期:</span>
						<span className="text-sm font-medium">
							{simulateConfig.interval || "未配置"}
						</span>
					</div>
				</div>
			) : (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						请先连接到K线节点以获取交易配置信息
					</AlertDescription>
				</Alert>
			)}

			{/* 指标配置提示 */}
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>请在指标设置中配置要计算的指标参数</AlertDescription>
			</Alert>
		</div>
	);
};

export default IndicatorNodeSimSettingPanel;
