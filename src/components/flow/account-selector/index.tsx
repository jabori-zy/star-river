import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { connectExchange, getExchangeStatus } from "@/service/exchange";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { ExchangeStatus } from "@/types/market";
import { type SelectedAccount, TradeMode } from "@/types/strategy";

interface AccountSelectorProps {
	label: string;
	tradeMode: TradeMode;
	selectedAccount: SelectedAccount | null; // 当前选中的账户
	onAccountChange: (account: SelectedAccount) => void; // 账户变更回调
	onConnectionStatusChange?: (
		status: ExchangeStatus,
		accountId: number,
	) => void; // 连接状态变化回调
}

// 已选择的账户列表
const AccountSelector: React.FC<AccountSelectorProps> = ({
	label,
	tradeMode,
	selectedAccount,
	onAccountChange,
	onConnectionStatusChange,
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
	const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus | null>(
		null,
	);
	const [isConnecting, setIsConnecting] = useState(false);
	const pollingTimer = useRef<NodeJS.Timeout | null>(null);

	// 清除轮询定时器
	const clearPollingTimer = useCallback(() => {
		if (pollingTimer.current) {
			clearInterval(pollingTimer.current);
			pollingTimer.current = null;
		}
	}, []);

	// 获取交易所状态
	const fetchExchangeStatus = useCallback(async () => {
		if (!localSelectedAccount?.id) return;
		try {
			const status = await getExchangeStatus(localSelectedAccount.id);
			const previousStatus = exchangeStatus;
			setExchangeStatus(status);

			// 当状态变化时触发回调
			if (status !== previousStatus && onConnectionStatusChange) {
				onConnectionStatusChange(status, localSelectedAccount.id);
			}

			return status;
		} catch (error) {
			console.error("获取交易所状态失败:", error);
			return null;
		}
	}, [localSelectedAccount?.id, exchangeStatus, onConnectionStatusChange]);

	// 开始轮询账户状态
	const startPolling = useCallback(async () => {
		clearPollingTimer();

		pollingTimer.current = setInterval(async () => {
			const status = await fetchExchangeStatus();
			if (status === "Connected") {
				clearPollingTimer();
				setIsConnecting(false);
			}
		}, 500);
	}, [fetchExchangeStatus, clearPollingTimer]);

	// 连接交易所
	const handleConnect = useCallback(async () => {
		if (!localSelectedAccount?.id) return;
		try {
			setIsConnecting(true);
			await connectExchange(localSelectedAccount.id);
			await startPolling();
		} catch (error) {
			console.error("连接交易所失败:", error);
			setIsConnecting(false);
		}
	}, [localSelectedAccount?.id, startPolling]);

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

		// 清理定时器
		return () => {
			clearPollingTimer();
		};
	}, [
		selectedAccount,
		accountList,
		tradeMode,
		startNodeBacktestConfig,
		startNodeLiveConfig,
		clearPollingTimer,
	]);

	// 当选择的账户变化时，获取交易所状态
	useEffect(() => {
		if (localSelectedAccount?.id) {
			fetchExchangeStatus();
		}
	}, [localSelectedAccount?.id, fetchExchangeStatus]);

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

			{/* 交易所未连接提示 */}
			{localSelectedAccount &&
				exchangeStatus &&
				exchangeStatus !== "Connected" && (
					<p className="text-sm text-gray-700">
						{localSelectedAccount.accountName} 未连接.{" "}
						<Button
							variant="link"
							className="h-auto p-0 text-sm text-yellow-600 hover:underline"
							onClick={handleConnect}
							disabled={isConnecting}
						>
							{isConnecting ? (
								<span className="flex items-center gap-1">
									<Spinner className="h-3 w-3" />
									连接中...
								</span>
							) : (
								"点击连接"
							)}
						</Button>
					</p>
				)}

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
