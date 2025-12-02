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
	selectedAccounts: SelectedAccount[]; // 已选择账户，可以多选
	setSelectedAccounts: (accounts: SelectedAccount[]) => void;
	updateSelectedAccounts: (accounts: SelectedAccount[]) => void;
}

// 账户选择器
const AccountSelector = ({
	selectedAccounts,
	setSelectedAccounts,
	updateSelectedAccounts,
}: AccountSelectorProps) => {
	const { t } = useTranslation();
	// 可用的MT5账户列表
	const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
	// 是否正在加载账户
	const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
	// 错误信息
	const [errorMessage, setErrorMessage] = useState<string>("");
	// 是否锁定账户选择
	const [isLockedSelect, setIsLockedSelect] = useState<boolean>(true);
	// 本地维护的账户列表 - 仅在内部使用
	const [localAccounts, setLocalAccounts] = useState<SelectedAccount[]>([]);
	// 账户连接状态 - key为accountId
	const [accountStatuses, setAccountStatuses] = useState<
		Record<number, ExchangeStatus>
	>({});
	// 正在连接的账户ID
	const [connectingAccounts, setConnectingAccounts] = useState<Set<number>>(
		new Set(),
	);
	// 轮询定时器引用
	const pollingTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

	// 获取账户数据
	const fetchAccountConfigs = async () => {
		setIsLoadingAccounts(true);
		setErrorMessage("");
		try {
			const accounts = (await getAccountConfigs(null)) as Account[];
			setAvailableAccounts(accounts);
		} catch (error) {
			console.error("获取账户配置失败:", error);
			setErrorMessage("获取账户配置失败");
			setAvailableAccounts([]);
		} finally {
			setIsLoadingAccounts(false);
		}
	};

	// 获取交易所状态
	const fetchExchangeStatus = useCallback(async (accountId: number) => {
		try {
			const status = await getExchangeStatus(accountId);
			// console.log("获取到的交易所状态:", status);
			setAccountStatuses((prev) => ({ ...prev, [accountId]: status }));
			return status;
		} catch (error) {
			console.error("获取交易所状态失败:", error);
			return null;
		}
	}, []);

	// 清除轮询定时器
	const clearPollingTimer = useCallback((accountId: number) => {
		const timer = pollingTimers.current.get(accountId);
		if (timer) {
			clearInterval(timer);
			pollingTimers.current.delete(accountId);
		}
	}, []);

	// 开始轮询账户状态
	const startPolling = useCallback(
		async (accountId: number) => {
			// 清除已存在的定时器
			clearPollingTimer(accountId);

			// 每500ms轮询一次
			const timer = setInterval(async () => {
				const status = await fetchExchangeStatus(accountId);
				if (status === ExchangeStatus.Connected) {
					// 连接成功，停止轮询
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

	// 连接交易所
	const handleConnectExchange = useCallback(
		async (accountId: number) => {
			try {
				setConnectingAccounts((prev) => new Set(prev).add(accountId));
				await connectExchange(accountId);
				// 开始轮询状态
				await startPolling(accountId);
			} catch (error) {
				console.error("连接交易所失败:", error);
				setConnectingAccounts((prev) => {
					const next = new Set(prev);
					next.delete(accountId);
					return next;
				});
			}
		},
		[startPolling],
	);

	// 组件卸载时清除所有定时器
	useEffect(() => {
		return () => {
			pollingTimers.current.forEach((timer) => clearInterval(timer));
			pollingTimers.current.clear();
		};
	}, []);

	// 初始化时从props同步到本地状态，并获取账户状态
	useEffect(() => {
		if (selectedAccounts && selectedAccounts.length > 0) {
			setLocalAccounts([...selectedAccounts]);

			// 获取所有已选择账户的交易所连接状态
			selectedAccounts.forEach((account) => {
				if (account.id !== 0) {
					fetchExchangeStatus(account.id);
				}
			});
		} else {
			setLocalAccounts([]);
		}
	}, [selectedAccounts, fetchExchangeStatus]);

	// 添加账户
	const handleAddAccount = () => {
		setIsLockedSelect(false);
		const newAccount = {
			id: 0,
			accountName: "",
			exchange: "" as Exchange,
			// 在 backtest 模式下，可用资金字段不需要用户输入，设置为 0
			availableBalance: 0,
		};
		setLocalAccounts((prev) => [...prev, newAccount]);
	};

	// 移除账户
	const handleRemoveAccount = (index: number) => {
		const newAccounts = [...localAccounts];
		newAccounts.splice(index, 1);
		setLocalAccounts(newAccounts);

		// 同步到父组件
		const validAccounts = newAccounts.filter((acc) => acc.id !== 0);
		setSelectedAccounts(validAccounts);
	};

	// 更新账户信息
	const updateLocalAccount = (
		index: number,
		updates: Partial<SelectedAccount>,
	) => {
		const newAccounts = [...localAccounts];
		newAccounts[index] = { ...newAccounts[index], ...updates };
		setLocalAccounts(newAccounts);

		// 同步到父组件
		const validAccounts = newAccounts.filter((acc) => acc.id !== 0);
		setSelectedAccounts(validAccounts);
	};

	// 获取可用的账户选项（剔除已选择的账户）
	const getAvailableAccountOptions = (currentIndex: number) => {
		// 获取已选择的账户ID列表（排除当前项）
		const selectedIds = localAccounts
			.filter((_, idx) => idx !== currentIndex)
			.map((acc) => acc.id)
			.filter((id) => id !== 0);

		// 过滤出未被选择的账户
		return availableAccounts.filter(
			(account) => !selectedIds.includes(account.id),
		);
	};

	// 处理账户选择变更
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

			// 获取账户的交易所连接状态
			await fetchExchangeStatus(numericId);
		}
	};

	// 处理下拉列表打开事件
	const handleSelectOpen = async (open: boolean) => {
		if (open && availableAccounts.length === 0) {
			await fetchAccountConfigs();
		}
	};

	// 渲染账户选择器
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
						<SelectValue placeholder="选择账户">
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
								加载账户中...
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
									? "所有账户已选择"
									: "暂无账户数据"}
							</div>
						)}
					</SelectContent>
				</Select>

				{!isLockedSelect && account.id !== 0 && (
					<ConfirmBox
						title="确认清除账户"
						description={`确定要清除账户 ${account.accountName} 吗？此操作无法撤销。`}
						confirmText="确认清除"
						cancelText="取消"
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
					{/* 锁定账户选择 */}
					{!isLockedSelect ? (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => {
								setIsLockedSelect(true);
								updateSelectedAccounts(localAccounts);
							}}
							title="锁定已选账户"
						>
							<LockOpen className="h-4 w-4" />
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setIsLockedSelect(false)}
							title="解锁已选账户"
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
						暂无账户选择
					</div>
				) : (
					localAccounts.map((account, index) => (
						<div
							key={`local-account-${index}`}
							className="flex items-center gap-2"
						>
							<div className="flex items-center gap-2">
								{/* 连接状态图标 */}
								{account.id !== 0 && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div
													className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
														accountStatuses[account.id] ===
															ExchangeStatus.Connected ||
														connectingAccounts.has(account.id)
															? "cursor-default"
															: "cursor-pointer hover:bg-gray-100"
													}`}
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
												</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{accountStatuses[account.id] ===
													ExchangeStatus.Connected
														? "已连接"
														: connectingAccounts.has(account.id)
															? "连接中..."
															: "click to connect"}
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
								placeholder="可用资金"
								disabled={isLockedSelect}
							/>
							<div className="flex items-center">
								{!isLockedSelect && (
									<>
										{account.id !== 0 ? (
											<ConfirmBox
												title="确认删除账户"
												description={`确定要删除账户 ${account.accountName} 吗？此操作无法撤销。`}
												confirmText="确认删除"
												cancelText="取消"
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

				{/* 添加账户按钮 */}
				{!isLockedSelect && (
					<Button
						variant="outline"
						size="sm"
						className="w-full h-8 mt-2 border-dashed"
						onClick={handleAddAccount}
					>
						<Plus className="h-3.5 w-3.5 mr-2" />
						添加账户
					</Button>
				)}

				{/* 显示可用账户状态 */}
				{availableAccounts.length > 0 &&
					localAccounts.filter((acc) => acc.id !== 0).length >=
						availableAccounts.length && (
						<div className="text-xs text-muted-foreground mt-1">
							所有可用账户已选择完毕
						</div>
					)}
			</div>
		</div>
	);
};

export default AccountSelector;
