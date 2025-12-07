import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import type { ExchangeStatus } from "@/types/market";
import type { SelectedAccount, TradeMode } from "@/types/strategy";

interface AccountSelectorProps {
	label: string;
	tradeMode?: TradeMode;
	selectedAccount: SelectedAccount | null; // Currently selected account
	accountList: SelectedAccount[];
	onAccountChange: (account: SelectedAccount) => void; // Account change callback
	onConnectionStatusChange?: (
		status: ExchangeStatus,
		accountId: number,
	) => void; // Connection status change callback
}

// Selected account list
const AccountSelector: React.FC<AccountSelectorProps> = ({
	label,
	accountList,
	selectedAccount,
	onAccountChange,
	onConnectionStatusChange,
}) => {
	const [localSelectedAccount, setLocalSelectedAccount] =
		useState<SelectedAccount | null>(selectedAccount);
	const hasAccounts = useMemo(() => accountList.length > 0, [accountList]);
	const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus | null>(
		null,
	);
	const [isConnecting, setIsConnecting] = useState(false);
	const pollingTimer = useRef<NodeJS.Timeout | null>(null);
	const { t } = useTranslation();
	// Clear polling timer
	const clearPollingTimer = useCallback(() => {
		if (pollingTimer.current) {
			clearInterval(pollingTimer.current);
			pollingTimer.current = null;
		}
	}, []);

	// Get exchange status
	const fetchExchangeStatus = useCallback(async () => {
		if (!localSelectedAccount?.id) return;
		try {
			const status = await getExchangeStatus(localSelectedAccount.id);
			const previousStatus = exchangeStatus;
			setExchangeStatus(status);

			// Trigger callback when status changes
			if (status !== previousStatus && onConnectionStatusChange) {
				onConnectionStatusChange(status, localSelectedAccount.id);
			}

			return status;
		} catch (error) {
			console.error("获取交易所状态失败:", error);
			return null;
		}
	}, [localSelectedAccount?.id, exchangeStatus, onConnectionStatusChange]);

	// Start polling account status
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

	// Connect to exchange
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

	// Get exchange status when selected account changes
	useEffect(() => {
		if (localSelectedAccount?.id) {
			fetchExchangeStatus();
		}
	}, [localSelectedAccount?.id, fetchExchangeStatus]);

	// Handle account selection change
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

			{/* Exchange not connected notification */}
			{localSelectedAccount &&
				exchangeStatus &&
				exchangeStatus !== "Connected" && (
					<p className="text-sm text-gray-700">
						{localSelectedAccount.accountName}{" "}
						{t("strategy.account.notConnected")}.{" "}
						<Button
							variant="link"
							className="h-auto p-0 text-sm text-yellow-600 hover:underline"
							onClick={handleConnect}
							disabled={isConnecting}
						>
							{isConnecting ? (
								<span className="flex items-center gap-1">
									<Spinner className="h-3 w-3" />
									{t("strategy.account.connecting")}
								</span>
							) : (
								t("strategy.account.connect")
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
						placeholder={
							hasAccounts
								? t("strategy.account.pleaseSelectAccount")
								: t("strategy.account.noAccount")
						}
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
				<p className="text-xs text-gray-500 mt-1">
					{t("strategy.account.pleaseConfigureAtStartNode")}
				</p>
			)}
		</div>
	);
};

export default AccountSelector;
