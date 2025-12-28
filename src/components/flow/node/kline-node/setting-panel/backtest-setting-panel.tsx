import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import FileUpload from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/kline-node";
import { useSupportKlineInterval } from "@/service/market/support-kline-interval";
import { useSymbolList } from "@/service/market/symbol-list";
import type { ExchangeStatus } from "@/types/market";
import type { StartNodeData } from "@/types/node/start-node";
import {
	BacktestDataSource,
	type SelectedAccount,
	TradeMode,
} from "@/types/strategy";
import SymbolSelector from "../components/symbol-selector";
import { InputWithTooltip } from "@/components/input-components/input-with-tooltip";

const KlineNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id }) => {
	const { t } = useTranslation();
	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData("start_node") as StartNodeData;
	const accountList =
		startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// ✅ Use new version hook to manage backtest config
	const { backtestConfig, updateSelectedAccount, updateSelectedSymbols, updateSeriesLength } =
		useBacktestConfig({ id });

	const selectedAccount = backtestConfig?.exchangeModeConfig?.selectedAccount;

	// Local state for series length input (save on blur)
	const [localSeriesLength, setLocalSeriesLength] = useState(
		backtestConfig?.seriesLength?.toString() || "200"
	);

	// Sync local state when backtestConfig changes (e.g., from external updates)
	useEffect(() => {
		setLocalSeriesLength(backtestConfig?.seriesLength?.toString() || "200");
	}, [backtestConfig?.seriesLength]);

	// Handle series length save on blur
	const handleSeriesLengthBlur = (value: string) => {
		const numValue = Number(value);
		if (!Number.isNaN(numValue) && numValue >= 1 && numValue <= 1000) {
			updateSeriesLength(numValue);
		}
	};

	// Get symbol list and supported kline intervals (fetched at parent to avoid duplicate requests in child components)
	const { data: symbolList = [] } = useSymbolList(selectedAccount?.id ?? 0);
	const { data: supportKlineInterval = [] } = useSupportKlineInterval(
		selectedAccount?.id ?? 0,
	);

	// Handle data source selection (exchange data source in backtest mode)
	const handleDataSourceChange = (selectedAccount: SelectedAccount) => {
		updateSelectedAccount({
			id: selectedAccount.id,
			exchange: selectedAccount.exchange,
			accountName: selectedAccount.accountName,
			availableBalance: selectedAccount.availableBalance,
		});
	};

	// Handle connection status change (TanStack Query handles cache refresh automatically, no manual trigger needed)
	const handleConnectionStatusChange = (_status: ExchangeStatus) => {
		// TanStack Query automatically refetches data based on accountId changes
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2 p-2">
				{backtestConfig?.dataSource === BacktestDataSource.EXCHANGE ? (
					<>
						<AccountSelector
							label={t("klineNode.dataSource")}
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
							selectedDataSource={selectedAccount}
							symbolList={symbolList}
							supportKlineInterval={supportKlineInterval}
						/>
						<div className="space-y-2 p-2">
							<Label className="text-sm font-medium">Series Length</Label>
							<InputWithTooltip
								value={localSeriesLength}
								onChange={setLocalSeriesLength}
								onBlur={handleSeriesLengthBlur}
								tooltipContent="Output series length. Between 1 and 1000"
								type="number"
								min={1}
								max={1000}
							/>
							<div className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
								<AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
								<span>
									Series length controls the kline series passed to the next
									node, affecting indicator calculations, custom operations, and
									conditional logic.
								</span>
							</div>
						</div>
						{/* <div className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-md">
							<Label className="text-sm font-bold whitespace-nowrap">
								{" "}
								{t("klineNode.timeRange")}:{" "}
							</Label>
							<Label className="text-xs text-muted-foreground">
								{" "}
								{timeRange?.startDate} ~ {timeRange?.endDate}{" "}
							</Label>
						</div> */}
					</>
				) : (
					<div className="space-y-4">
						<div className="space-y-1">
							<Label htmlFor="file-upload" className="text-xs">
								Upload Kline Data File
							</Label>
							<FileUpload
								maxSize={20 * 1024 * 1024} // 20MB
								accept=".csv,.xls,.xlsx"
								onFilesChange={(files) => {
									console.log(files);
								}}
								dropAreaHeight="h-24"
								customText={{
									title: "Upload Data File",
									description: "Drag and drop or click to upload",
									emptyState: "Supports CSV or Excel format kline data files",
								}}
							/>
						</div>
						<div className="text-xs text-muted-foreground">
							Supports CSV or Excel format kline data files, must include timestamp, open price, high price, low price, close price, and volume
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default KlineNodeBacktestSettingPanel;
