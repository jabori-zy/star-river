import {
	AlertCircle,
	DollarSign,
	Link,
	Lock,
	LockOpen,
	Plus,
	Unlink,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmBox from "@/components/confirm-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAccountConfigs } from "@/service/account";
import { connectExchange, getExchangeStatus } from "@/service/exchange";
import type { Account } from "@/types/account";
import type { Exchange } from "@/types/market";
import { ExchangeStatus } from "@/types/market";
import type { SelectedAccount } from "@/types/strategy";

interface AccountSelectorProps {
	selectedAccounts: SelectedAccount[]; // Selected accounts, multiple selection allowed
	setSelectedAccounts: (accounts: SelectedAccount[]) => void;
	updateSelectedAccounts: (accounts: SelectedAccount[]) => void;
}

// Account selector
const AccountSelector = ({
	selectedAccounts,
	setSelectedAccounts,
	updateSelectedAccounts,
}: AccountSelectorProps) => {
	const { t } = useTranslation();
	// Available MT5 account list
	const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
	// Loading accounts status
	const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
	// Error message
	const [errorMessage, setErrorMessage] = useState<string>("");
	// Lock account selection
	const [isLockedSelect, setIsLockedSelect] = useState<boolean>(true);
	// Local maintained account list - internal use only
	const [localAccounts, setLocalAccounts] = useState<SelectedAccount[]>([]);
	// Account connection status - key is accountId
	const [accountStatuses, setAccountStatuses] = useState<
		Record<number, ExchangeStatus>
	>({});
	// Currently connecting account IDs
	const [connectingAccounts, setConnectingAccounts] = useState<Set<number>>(
		new Set(),
	);
	// Polling timer reference
	const pollingTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

	// Fetch account data
	const fetchAccountConfigs = async () => {
		setIsLoadingAccounts(true);
		setErrorMessage("");
		try {
			const accounts = (await getAccountConfigs(null)) as Account[];
			setAvailableAccounts(accounts);
		} catch (error) {
			console.error("Failed to get account config:", error);
			setErrorMessage("Failed to get account config");
			setAvailableAccounts([]);
		} finally {
			setIsLoadingAccounts(false);
		}
	};

	// Fetch exchange status
	const fetchExchangeStatus = useCallback(async (accountId: number) => {
		try {
			const status = await getExchangeStatus(accountId);
			// console.log("Fetched exchange status:", status);
			setAccountStatuses((prev) => ({ ...prev, [accountId]: status }));
			return status;
		} catch (error) {
			console.error("Failed to get exchange status:", error);
			return null;
		}
	}, []);

	// Clear polling timer
	const clearPollingTimer = useCallback((accountId: number) => {
		const timer = pollingTimers.current.get(accountId);
		if (timer) {
			clearInterval(timer);
			pollingTimers.current.delete(accountId);
		}
	}, []);

	// Start polling account status
	const startPolling = useCallback(
		async (accountId: number) => {
			// Clear existing timer
			clearPollingTimer(accountId);

			// Poll every 500ms
			const timer = setInterval(async () => {
				const status = await fetchExchangeStatus(accountId);
				if (status === ExchangeStatus.Connected) {
					// Connected successfully, stop polling
					clearPollingTimer(accountId);
					setConnectingAccounts((prev) => {
						const next = new Set(prev);
						next.delete(accountId);
						return next;
					});
				}
			}, 500);

			pollingTimers.current.set(accountId, timer);
		},
		[fetchExchangeStatus, clearPollingTimer],
	);

	// Connect to exchange
	const handleConnectExchange = useCallback(
		async (accountId: number) => {
			try {
				setConnectingAccounts((prev) => new Set(prev).add(accountId));
				await connectExchange(accountId);
				// Start polling status
				await startPolling(accountId);
			} catch (error) {
				console.error("Failed to connect to exchange:", error);
				setConnectingAccounts((prev) => {
					const next = new Set(prev);
					next.delete(accountId);
					return next;
				});
			}
		},
		[startPolling],
	);

	// Clear all timers when component unmounts
	useEffect(() => {
		return () => {
			pollingTimers.current.forEach((timer) => clearInterval(timer));
			pollingTimers.current.clear();
		};
	}, []);

	// Sync from props to local state on init, and fetch account status
	useEffect(() => {
		if (selectedAccounts && selectedAccounts.length > 0) {
			setLocalAccounts([...selectedAccounts]);

			// Fetch exchange connection status for all selected accounts
			selectedAccounts.forEach((account) => {
				if (account.id !== 0) {
					fetchExchangeStatus(account.id);
				}
			});
		} else {
			setLocalAccounts([]);
		}
	}, [selectedAccounts, fetchExchangeStatus]);

	// Add account
	const handleAddAccount = () => {
		setIsLockedSelect(false);
		const newAccount = {
			id: 0,
			accountName: "",
			exchange: "" as Exchange,
			// In backtest mode, available balance field doesn't need user input, set to 0
			availableBalance: 0,
		};
		setLocalAccounts((prev) => [...prev, newAccount]);
	};

	// Remove account
	const handleRemoveAccount = (index: number) => {
		const newAccounts = [...localAccounts];
		newAccounts.splice(index, 1);
		setLocalAccounts(newAccounts);

		// Sync to parent component
		const validAccounts = newAccounts.filter((acc) => acc.id !== 0);
		setSelectedAccounts(validAccounts);
	};

	// Update account info
	const updateLocalAccount = (
		index: number,
		updates: Partial<SelectedAccount>,
	) => {
		const newAccounts = [...localAccounts];
		newAccounts[index] = { ...newAccounts[index], ...updates };
		setLocalAccounts(newAccounts);

		// Sync to parent component
		const validAccounts = newAccounts.filter((acc) => acc.id !== 0);
		setSelectedAccounts(validAccounts);
	};

	// Get available account options (excluding already selected accounts)
	const getAvailableAccountOptions = (currentIndex: number) => {
		// Get selected account ID list (excluding current item)
		const selectedIds = localAccounts
			.filter((_, idx) => idx !== currentIndex)
			.map((acc) => acc.id)
			.filter((id) => id !== 0);

		// Filter out unselected accounts
		return availableAccounts.filter(
			(account) => !selectedIds.includes(account.id),
		);
	};

	// Handle account selection change
	const handleAccountChange = async (index: number, selectedId: string) => {
		if (!selectedId) return;

		const numericId = parseInt(selectedId);
		const selectedAccount = availableAccounts.find(
			(acc) => acc.id === numericId,
		);

		if (selectedAccount) {
			updateLocalAccount(index, {
				id: numericId,
				accountName: selectedAccount.accountName,
				exchange: selectedAccount.exchange as Exchange,
				availableBalance: 0,
			});

			// Fetch exchange connection status for account
			await fetchExchangeStatus(numericId);
		}
	};

	// Handle dropdown open event
	const handleSelectOpen = async (open: boolean) => {
		if (open && availableAccounts.length === 0) {
			await fetchAccountConfigs();
		}
	};

	// Render account selector
	const renderAccountSelector = (account: SelectedAccount, index: number) => {
		const availableOptions = getAvailableAccountOptions(index);

		return (
			<div className="relative group">
				<Select
					value={account.id !== 0 ? account.id.toString() : ""}
					onValueChange={(value) => handleAccountChange(index, value)}
					onOpenChange={(open) => handleSelectOpen(open)}
					disabled={isLockedSelect}
				>
					<SelectTrigger className="h-8 text-xs w-[180px]">
						<SelectValue placeholder={t("startNode.accountSelector.selectAccount")}>
							<div className="flex items-center gap-0.5">
								{account.accountName}
								{account.exchange && (
									<Badge variant="outline">{account.exchange}</Badge>
								)}
							</div>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{isLoadingAccounts ? (
							<div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
								{t("startNode.accountSelector.loadingAccounts")}
							</div>
						) : availableOptions.length > 0 ? (
							availableOptions.map((item) => (
								<SelectItem key={item.id} value={item.id.toString()}>
									<div className="flex items-center text-xs gap-0.5">
										{item.accountName}
										<Badge variant="outline">{item.exchange}</Badge>
									</div>
								</SelectItem>
							))
						) : (
							<div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
								{availableAccounts.length > 0
									? t("startNode.accountSelector.allAccountsSelected")
									: t("startNode.accountSelector.noAccountData")}
							</div>
						)}
					</SelectContent>
				</Select>

				{!isLockedSelect && account.id !== 0 && (
					<ConfirmBox
						title={t("startNode.accountSelector.confirmDeleteAccount")}
						description={t("startNode.accountSelector.confirmDeleteAccountDescription", {
							accountName: account.accountName,
						})}
						confirmText={t("common.confirm")}
						cancelText={t("common.cancel")}
						onConfirm={() => {
							updateLocalAccount(index, {
								id: 0,
								accountName: "",
								exchange: "" as Exchange,
							});
						}}
					>
						<Button
							variant="ghost"
							size="sm"
							className="h-4 w-4 p-0 absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<X className="h-3 w-3" />
						</Button>
					</ConfirmBox>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<DollarSign className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">{t("startNode.account")}</span>
				</div>
				<div className="flex items-center gap-2">
					{/* Lock account selection */}
					{!isLockedSelect ? (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => {
								setIsLockedSelect(true);
								updateSelectedAccounts(localAccounts);
							}}
							title="Lock selected accounts"
						>
							<LockOpen className="h-4 w-4" />
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setIsLockedSelect(false)}
							title="Unlock selected accounts"
						>
							<Lock className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{errorMessage && (
				<div className="flex items-center p-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded">
					<AlertCircle className="h-4 w-4 mr-2" />
					{errorMessage}
				</div>
			)}

			<div className="space-y-2">
				{localAccounts.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{t("startNode.accountSelector.noAccount")}
					</div>
				) : (
					localAccounts.map((account, index) => (
						<div
							key={account.id}
							className="flex items-center gap-2"
						>
							<div className="flex items-center gap-2">
								{/* Connection status icon */}
								{account.id !== 0 && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={
														accountStatuses[account.id] ===
															ExchangeStatus.Connected ||
														connectingAccounts.has(account.id)
															? "cursor-default hover:bg-transparent"
															: ""
													}
													onClick={() => {
														if (
															accountStatuses[account.id] !==
																ExchangeStatus.Connected &&
															!connectingAccounts.has(account.id)
														) {
															handleConnectExchange(account.id);
														}
													}}
												>
													{connectingAccounts.has(account.id) ? (
														<Spinner className="h-4 w-4" />
													) : accountStatuses[account.id] ===
														ExchangeStatus.Connected ? (
														<Link className="h-4 w-4 text-green-600" />
													) : (
														<Unlink className="h-4 w-4 text-gray-500" />
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{accountStatuses[account.id] ===
													ExchangeStatus.Connected
														? t("startNode.accountSelector.connected")
														: connectingAccounts.has(account.id)
															? t("startNode.accountSelector.connecting")
															: t("startNode.accountSelector.clickToConnect")}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</div>
							{renderAccountSelector(account, index)}
							<Input
								type="number"
								value={(account.availableBalance ?? 0).toString()}
								onChange={(e) =>
									updateLocalAccount(index, {
										availableBalance: Number(e.target.value) || 0,
									})
								}
								className="h-8 flex-1 text-sm"
								placeholder="Available balance"
								disabled={isLockedSelect}
							/>
							<div className="flex items-center">
								{!isLockedSelect && (
									<>
										{account.id !== 0 ? (
											<ConfirmBox
												title={t("startNode.accountSelector.confirmDeleteAccount")}
												description={t("startNode.accountSelector.confirmDeleteAccountDescription", {
													accountName: account.accountName,
												})}
												confirmText={t("common.confirm")}
												cancelText={t("common.cancel")}
												onConfirm={() => handleRemoveAccount(index)}
											>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<X className="h-4 w-4" />
												</Button>
											</ConfirmBox>
										) : (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleRemoveAccount(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</>
								)}
							</div>
						</div>
					))
				)}

				{/* Add account button */}
				{!isLockedSelect && (
					<Button
						variant="outline"
						size="sm"
						className="w-full h-8 mt-2 border-dashed"
						onClick={handleAddAccount}
					>
						<Plus className="h-3.5 w-3.5 mr-2" />
						{t("startNode.accountSelector.addAccount")}
					</Button>
				)}

				{/* Show available account status */}
				{availableAccounts.length > 0 &&
					localAccounts.filter((acc) => acc.id !== 0).length >=
						availableAccounts.length && (
						<div className="text-xs text-muted-foreground mt-1">
							{t("startNode.accountSelector.allAccountsSelected")}
						</div>
					)}
			</div>
		</div>
	);
};

export default AccountSelector;
