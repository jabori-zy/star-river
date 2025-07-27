// import { FileWithPreview } from "@/hooks/use-file-upload"
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
// import { getNodeDefaultInputHandleId, NodeType } from "@/types/node/index";
import FileUpload from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { useUpdateBacktestConfig } from "@/hooks/node/kline-node/use-update-backtest-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type { KlineNodeData } from "@/types/node/kline-node";
import {
	BacktestDataSource,
	type SelectedAccount,
	TradeMode,
} from "@/types/strategy";
// import { useNodeConnections, useReactFlow } from "@xyflow/react";
// import { useEffect, useState } from "react";
// import { StartNodeData } from "@/types/node/start-node";
import SymbolSelector from "../components/symbol-selector";

const KlineNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	const klineNodeData = data as KlineNodeData;

	// 开始节点的回测配置
	const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

	// 回测数据源
	const backtestDataSource = startNodeBacktestConfig?.dataSource;

	// const { getNode } = useReactFlow()

	// 当前节点的connection
	// const connections = useNodeConnections({id, handleType: 'target', handleId: getNodeDefaultInputHandleId(id, NodeType.KlineNode)})

	// timeRange
	const timeRange = startNodeBacktestConfig?.exchangeModeConfig?.timeRange;

	// 使用自定义hook管理回测配置
	const {
		config: backtestConfig,
		updateSelectedAccount,
		updateSelectedSymbols,
	} = useUpdateBacktestConfig({
		id,
		initialBacktestConfig: klineNodeData.backtestConfig,
	});

	// 处理数据源选择（回测模式下选择的是交易所数据源）
	const handleDataSourceChange = (selectedAccount: SelectedAccount) => {
		updateSelectedAccount({
			id: selectedAccount.id,
			exchange: selectedAccount.exchange,
			accountName: selectedAccount.accountName,
			availableBalance: selectedAccount.availableBalance,
		});
	};

	return (
		// space-y-4 是上下间距为4
		<div className="space-y-4">
			{backtestDataSource === BacktestDataSource.EXCHANGE ? (
				<>
					<AccountSelector
						label="回测账户"
						tradeMode={TradeMode.BACKTEST}
						selectedAccount={
							backtestConfig?.exchangeModeConfig?.selectedAccount || null
						}
						onAccountChange={handleDataSourceChange}
					/>
					<SymbolSelector
						selectedSymbols={
							backtestConfig?.exchangeModeConfig?.selectedSymbols || []
						}
						onSymbolsChange={updateSelectedSymbols}
						selectedDataSource={
							backtestConfig?.exchangeModeConfig?.selectedAccount
						}
					/>
					<div className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-md">
						<Label className="text-sm font-bold"> 回测时间范围： </Label>
						<Label className="text-xs text-muted-foreground">
							{" "}
							{timeRange?.startDate} ~ {timeRange?.endDate}{" "}
						</Label>
					</div>
				</>
			) : (
				<div className="space-y-4">
					<div className="space-y-1">
						<Label htmlFor="file-upload" className="text-xs">
							上传K线数据文件
						</Label>
						<FileUpload
							maxSize={20 * 1024 * 1024} // 20MB
							accept=".csv,.xls,.xlsx"
							onFilesChange={(files) => {
								console.log(files);
							}}
							dropAreaHeight="h-24"
							customText={{
								title: "上传数据文件",
								description: "拖放或点击上传",
								emptyState: "支持CSV或Excel格式的K线数据文件",
							}}
						/>
					</div>
					<div className="text-xs text-muted-foreground">
						支持CSV或Excel格式的K线数据文件，需包含时间戳、开盘价、最高价、最低价、收盘价和成交量
					</div>
				</div>
			)}
		</div>
	);
};

export default KlineNodeBacktestSettingPanel;
