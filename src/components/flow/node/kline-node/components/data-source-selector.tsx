import type React from "react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { StartNode, StartNodeData } from "@/types/node/start-node";
import { type SelectedAccount, TradeMode } from "@/types/strategy";

interface DataSourceSelectorProps {
	startNode: StartNode | null; // Connected start node
	tradeMode: TradeMode;
	selectedAccount?: SelectedAccount | null; // Currently selected account
	onAccountChange?: (account: SelectedAccount) => void; // Account change callback
}

// Selected account list
const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
	startNode,
	tradeMode,
	selectedAccount,
	onAccountChange,
}) => {
	const startNodeData = startNode?.data as StartNodeData;

	// Get account list based on trade mode
	const accountList = useMemo(() => {
		if (!startNodeData) return [];

		switch (tradeMode) {
			case TradeMode.LIVE:
				return startNodeData.liveConfig?.selectedAccounts || [];
			case TradeMode.BACKTEST:
				return (
					startNodeData.backtestConfig?.exchangeModeConfig?.selectedAccounts ||
					[]
				);
			case TradeMode.SIMULATE:
				return startNodeData.simulateConfig?.selectedAccounts || [];
			default:
				return [];
		}
	}, [startNodeData, tradeMode]);

	// Check if there are available accounts/exchanges
	const hasAccounts = accountList.length > 0;

	// Handle account selection change
	const handleAccountChange = (accountId: string) => {
		const selectedAcc = accountList.find(
			(acc) => acc.id.toString() === accountId,
		);
		if (selectedAcc && onAccountChange) {
			onAccountChange(selectedAcc);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-bold text-gray-700">Data Source</label>

			<Select
				disabled={!hasAccounts}
				value={selectedAccount?.id?.toString() || ""}
				onValueChange={handleAccountChange}
			>
				<SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
					<SelectValue
						placeholder={hasAccounts ? "Please select account" : "No exchange selected for current strategy"}
					/>
				</SelectTrigger>
				{hasAccounts && (
					<SelectContent>
						{accountList.map((account, index) => (
							<SelectItem
								key={`${account.id}-${index}`}
								value={`${account.id}`}
							>
								<div className="flex items-center justify-between w-full">
									<span>{account.accountName}</span>
									<Badge
										variant="outline"
										className="text-xs text-gray-500 ml-2"
									>
										{account.exchange}
									</Badge>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				)}
			</Select>

			{!hasAccounts && (
				<p className="text-xs text-gray-500 mt-1">
					Configure at strategy start point:
					{tradeMode === TradeMode.LIVE
						? "Live account"
						: tradeMode === TradeMode.BACKTEST
							? "Backtest data source"
							: "Simulated account"}
				</p>
			)}
		</div>
	);
};

export default DataSourceSelector;
