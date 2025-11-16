import { useState } from "react";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import FileUpload from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import type { ExchangeStatus } from "@/types/market";
import {
	BacktestDataSource,
	type SelectedAccount,
	TradeMode,
} from "@/types/strategy";
import SymbolSelector from "../components/symbol-selector";
import type { StartNodeData } from "@/types/node/start-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/kline-node";

const KlineNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData("start_node") as StartNodeData;
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// 刷新触发器 - 用于触发 SymbolSelector 重新获取交易对列表
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// ✅ 使用新版本 hook 管理回测配置
	const {
		backtestConfig,
		updateSelectedAccount,
		updateSelectedSymbols,
	} = useBacktestConfig({ id });

	const timeRange = backtestConfig?.exchangeModeConfig?.timeRange;

	// 处理数据源选择（回测模式下选择的是交易所数据源）
	const handleDataSourceChange = (selectedAccount: SelectedAccount) => {
		updateSelectedAccount({
			id: selectedAccount.id,
			exchange: selectedAccount.exchange,
			accountName: selectedAccount.accountName,
			availableBalance: selectedAccount.availableBalance,
		});
	};

	// 处理连接状态变化
	const handleConnectionStatusChange = (
		status: ExchangeStatus,
	) => {
		if (status === "Connected") {
			setRefreshTrigger((prev) => prev + 1);
		}
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2 p-2">
			{backtestConfig?.dataSource === BacktestDataSource.EXCHANGE ? (
				<>
					<AccountSelector
						label="回测账户"
						tradeMode={TradeMode.BACKTEST}
						selectedAccount={
							backtestConfig?.exchangeModeConfig?.selectedAccount || null
						}
						accountList={accountList}
						onAccountChange={handleDataSourceChange}
						onConnectionStatusChange={handleConnectionStatusChange}
					/>
					<SymbolSelector
						nodeId={id}
						selectedSymbols={
							backtestConfig?.exchangeModeConfig?.selectedSymbols || []
						}
						onSymbolsChange={updateSelectedSymbols}
						selectedDataSource={
							backtestConfig?.exchangeModeConfig?.selectedAccount
						}
						refreshTrigger={refreshTrigger}
					/>
					<div className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-md">
						<Label className="text-sm font-bold whitespace-nowrap">
							{" "}
							回测时间范围：{" "}
						</Label>
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
		</div>
	);
};

export default KlineNodeBacktestSettingPanel;
