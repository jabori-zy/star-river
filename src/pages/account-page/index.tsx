"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAccountSSE from "@/hooks/use-accountSSE";
import { addAccountConfig, getAccountConfigs } from "@/service/account";
import type { BinanceAccount, MT5Account } from "@/types/account";
import { AccountsHeader } from "./components/account-header";
import { AccountTable } from "./components/account-table";
import { binanceColumns, okxColumns } from "./components/account-table/columns";
import { BinanceAccountTable } from "./components/binance-account-table";
import { MT5AccountTable } from "./components/mt5-account-table";

// 定义账户类型
type AccountType = {
	id: string;
	name: string;
};

// 账户类型数据
const accountTypes: AccountType[] = [
	{
		id: "metatrader5",
		name: "Metatrader5",
	},
	{
		id: "binance",
		name: "Binance",
	},
	{
		id: "okx",
		name: "OKX",
	},
];

export default function AccountPage() {
	// 当前选中的标签页
	const [activeTab, setActiveTab] = useState("metatrader5");
	// 账户数据，要么存储MT5账户数据，要么存储Binance账户数据，要么存储OKX账户数据
	const [mt5AccountData, setMt5AccountData] = useState<MT5Account[]>([]);
	const [binanceAccountData, setBinanceAccountData] = useState<
		BinanceAccount[]
	>([]);
	// 获取SSE实时数据
	const accountUpdateMessage = useAccountSSE();

	// 获取账户数据
	const getAccountConfig = useCallback(async (exchange: string) => {
		const accountData = await getAccountConfigs(exchange);
		console.log("获取到的账户数据:", accountData);
		if (exchange === "metatrader5") {
			setMt5AccountData(accountData as MT5Account[]);
		} else if (exchange === "binance") {
			setBinanceAccountData(accountData as BinanceAccount[]);
		}
	}, []);

	// 处理页面首次加载和Tab切换时获取数据
	useEffect(() => {
		// 获取账户数据
		getAccountConfig(activeTab);
	}, [activeTab, getAccountConfig]);

	// 处理SSE实时数据更新
	useEffect(() => {
		if (
			accountUpdateMessage &&
			accountUpdateMessage.event_name === "account-updated"
		) {
			// console.log("收到MT5账户实时数据:", accountUpdateMessage);

			// 更新MT5账户数据
			setMt5AccountData((prevData) => {
				// 根据terminal_id与id匹配，更新账户数据
				const updatedData = prevData.map((account) => {
					// 如果account_info为null，则将客户端设置为断开，EA设置为关闭
					if (
						!accountUpdateMessage.account_info &&
						accountUpdateMessage.account_config.id === account.id
					) {
						return {
							...account,
							terminalStatus: "disconnected",
							eaStatus: "close",
						};
					}

					// 如果account_info.account_id与account.id匹配，则更新账户数据
					if (
						accountUpdateMessage.account_config.id === account.id &&
						accountUpdateMessage.account_info
					) {
						// 更新账户数据
						return {
							...account,
							// 更新指定字段
							leverage: accountUpdateMessage.account_info.info.leverage,
							balance: accountUpdateMessage.account_info.info.balance,
							equity: accountUpdateMessage.account_info.info.equity,
							margin: accountUpdateMessage.account_info.info.margin,
							terminalStatus: accountUpdateMessage.account_info.info
								.terminal_connected
								? "connected"
								: "disconnected",
							eaStatus: accountUpdateMessage.account_info.info.trade_allowed
								? "open"
								: "close",
							creatTime: accountUpdateMessage.account_info.create_time,
							// 其他字段保持不变
						};
					}
					// 如果不匹配，保持原有数据不变
					return account;
				});

				// console.log("更新后的数据:", updatedData);
				return updatedData;
			});
		}
	}, [accountUpdateMessage]);

	// 处理标签页切换
	const handleTabChange = (value: string) => {
		// 根据选中的标签页，获取对应的账户数据
		setActiveTab(value);
		// 根据选中的标签页，获取对应的账户数据
		getAccountConfigs(value);
	};

	// 处理添加账户
	const handleAddAccount = async (formData: any) => {
		console.log("添加账户数据:", formData);
		const { accountName, exchange, ...accountConfig } = formData;
		const res = await addAccountConfig(accountName, exchange, accountConfig);
		console.log("添加账户配置成功:", res);
		if (res.code === 200) {
			// 刷新页面
			window.location.reload();
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				<Tabs
					defaultValue="metatrader5"
					className="w-full"
					onValueChange={handleTabChange}
				>
					<div className="flex items-center justify-between mb-6">
						<TabsList>
							{accountTypes.map((type) => (
								<TabsTrigger key={type.id} value={type.id} className="gap-1">
									{type.name}
								</TabsTrigger>
							))}
						</TabsList>

						{/* 添加账户按钮 */}
						<AccountsHeader
							activeTab={activeTab}
							onAddAccount={handleAddAccount}
						/>
					</div>

					<TabsContent value="metatrader5">
						<MT5AccountTable
							tableData={mt5AccountData}
							title="Metatrader5 账户"
						/>
					</TabsContent>

					<TabsContent value="binance">
						<BinanceAccountTable
							tableData={binanceAccountData}
							title="Binance 账户"
						/>
					</TabsContent>

					<TabsContent value="okx">
						<AccountTable
							tableData={mt5AccountData}
							columns={okxColumns as any}
							title="OKX 账户"
						/>
					</TabsContent>
				</Tabs>
			</div>
			<Toaster richColors position="top-center" />
		</div>
	);
}
