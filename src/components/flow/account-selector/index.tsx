import React, { useState, useEffect } from "react";
import { SelectedAccount } from "@/types/strategy";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TradeMode } from "@/types/strategy";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";

interface AccountSelectorProps {
	label: string;
	tradeMode: TradeMode;
	selectedAccount: SelectedAccount | null; // 当前选中的账户
	onAccountChange: (account: SelectedAccount) => void; // 账户变更回调
}

// 已选择的账户列表
const AccountSelector: React.FC<AccountSelectorProps> = ({
	label,
	tradeMode,
	selectedAccount,
	onAccountChange,
}) => {
	// 开始节点的回测配置
	const {
		backtestConfig: startNodeBacktestConfig,
		liveConfig: startNodeLiveConfig,
	} = useStartNodeDataStore();

	// 可选的账户列表
	const [accountList, setAccountList] = useState<SelectedAccount[]>(
		tradeMode === TradeMode.BACKTEST
			? startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts || []
			: tradeMode === TradeMode.LIVE
				? startNodeLiveConfig?.selectedAccounts || []
				: [],
	);

	const [localSelectedAccount, setLocalSelectedAccount] =
		useState<SelectedAccount | null>(selectedAccount);
	const [hasAccounts, setHasAccounts] = useState<boolean>(
		accountList.length > 0,
	);

	useEffect(() => {
		if (tradeMode === TradeMode.BACKTEST) {
			setAccountList(
				startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts || [],
			);
		} else if (tradeMode === TradeMode.LIVE) {
			setAccountList(startNodeLiveConfig?.selectedAccounts || []);
		}
		if (selectedAccount) {
			setLocalSelectedAccount(selectedAccount);
		}
		// 如果账户列表为空，则设置为false
		if (accountList.length === 0) {
			setHasAccounts(false);
		} else {
			setHasAccounts(true);
		}
	}, [
		selectedAccount,
		accountList,
		tradeMode,
		startNodeBacktestConfig,
		startNodeLiveConfig,
	]);

	// 处理账户选择变更
	const handleAccountChange = (accountId: string) => {
		const selectedAcc = accountList?.find(
			(acc) => acc.id.toString() === accountId,
		);
		if (selectedAcc) {
			setLocalSelectedAccount(selectedAcc);
			if (onAccountChange) {
				onAccountChange(selectedAcc);
			}
		}
	};

	return (
		<div className="flex flex-col gap-2 p-2 rounded-md">
			<div className="text-sm font-bold">{label}</div>
			<Select
				disabled={!hasAccounts}
				value={localSelectedAccount?.id?.toString() || ""}
				onValueChange={handleAccountChange}
			>
				<SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
					<SelectValue
						placeholder={hasAccounts ? "请选择账户" : "未配置账户"}
					/>
				</SelectTrigger>
				{hasAccounts && (
					<SelectContent>
						{accountList.map((account) => (
							<SelectItem key={account.id} value={account.id.toString()}>
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
				<p className="text-xs text-gray-500 mt-1">在策略起点配置</p>
			)}
		</div>
	);
};

export default AccountSelector;
