import { useState, useEffect } from "react";
import { SelectedAccount } from "@/types/strategy";
import { Exchange } from "@/types/common";
import { MT5Account } from "@/types/account";
import { getAccountConfigs } from "@/service/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { X, Plus, AlertCircle, DollarSign } from "lucide-react";

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
	// 可用的MT5账户列表
	const [availableMT5Accounts, setAvailableMT5Accounts] = useState<
		MT5Account[]
	>([]);
	// 是否正在加载账户
	const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
	// 错误信息
	const [errorMessage, setErrorMessage] = useState<string>("");
	// 是否锁定账户选择
	const [isLockedSelect, setIsLockedSelect] = useState<boolean>(true);
	// 本地维护的账户列表 - 仅在内部使用
	const [localAccounts, setLocalAccounts] = useState<SelectedAccount[]>([]);

	// 获取账户数据
	const fetchAccountConfigs = async () => {
		setIsLoadingAccounts(true);
		setErrorMessage("");
		try {
			const accounts = await getAccountConfigs("metatrader5");
			setAvailableMT5Accounts(accounts);
			console.log("获取到的MT5账户配置:", accounts);
		} catch (error) {
			console.error("获取账户配置失败:", error);
			setErrorMessage("获取账户配置失败");
			setAvailableMT5Accounts([]);
		} finally {
			setIsLoadingAccounts(false);
		}
	};

	// 初始化时从props同步到本地状态
	useEffect(() => {
		if (selectedAccounts && selectedAccounts.length > 0) {
			setLocalAccounts([...selectedAccounts]);
		} else {
			setLocalAccounts([]);
		}
	}, [selectedAccounts]);

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
		return availableMT5Accounts.filter(
			(account) => !selectedIds.includes(account.id),
		);
	};

	// 处理账户选择变更
	const handleAccountChange = (index: number, selectedId: string) => {
		if (!selectedId) return;

		const numericId = parseInt(selectedId);
		const selectedAccount = availableMT5Accounts.find(
			(acc) => acc.id === numericId,
		);

		if (selectedAccount) {
			updateLocalAccount(index, {
				id: numericId,
				accountName: selectedAccount.accountName,
				exchange: selectedAccount.exchange as Exchange,
				availableBalance: 0,
			});
		}
	};

	// 处理下拉列表打开事件
	const handleSelectOpen = async (open: boolean) => {
		if (open && availableMT5Accounts.length === 0) {
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
								{availableMT5Accounts.length > 0
									? "所有账户已选择"
									: "暂无账户数据"}
							</div>
						)}
					</SelectContent>
				</Select>

				{account.id !== 0 && !isLockedSelect && (
					<Button
						variant="ghost"
						size="sm"
						className="h-4 w-4 p-0 absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation();
							updateLocalAccount(index, {
								id: 0,
								accountName: "",
								exchange: "" as Exchange,
							});
						}}
					>
						<X className="h-3 w-3" />
					</Button>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<DollarSign className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">交易账户</span>
				</div>
				<div className="flex items-center gap-2">
					{/* 锁定账户选择 */}
					{!isLockedSelect ? (
						<Button
							variant="default"
							size="sm"
							className="flex items-center justify-center text-xs"
							onClick={() => {
								setIsLockedSelect(true);
								updateSelectedAccounts(localAccounts);
							}}
						>
							锁定已选账户
						</Button>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="flex items-center justify-center text-xs bg-red-200"
							onClick={() => setIsLockedSelect(false)}
						>
							解锁已选账户
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

			<div className="space-y-3">
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
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => handleRemoveAccount(index)}
									>
										<X className="h-4 w-4" />
									</Button>
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
				{availableMT5Accounts.length > 0 &&
					localAccounts.filter((acc) => acc.id !== 0).length >=
						availableMT5Accounts.length && (
						<div className="text-xs text-muted-foreground mt-1">
							所有可用账户已选择完毕
						</div>
					)}
			</div>
		</div>
	);
};

export default AccountSelector;
