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

// Define account type
type AccountType = {
	id: string;
	name: string;
};

// Account type data
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
	// Currently selected tab
	const [activeTab, setActiveTab] = useState("metatrader5");
	// Account data - can store MT5 account data, Binance account data, or OKX account data
	const [mt5AccountData, setMt5AccountData] = useState<MT5Account[]>([]);
	const [binanceAccountData, setBinanceAccountData] = useState<
		BinanceAccount[]
	>([]);
	// Get SSE real-time data
	const accountUpdateMessage = useAccountSSE();

	// Get account data
	const getAccountConfig = useCallback(async (exchange: string) => {
		const accountData = await getAccountConfigs(exchange);
		console.log("Retrieved account data:", accountData);
		if (exchange === "metatrader5") {
			setMt5AccountData(accountData as MT5Account[]);
		} else if (exchange === "binance") {
			setBinanceAccountData(accountData as BinanceAccount[]);
		}
	}, []);

	// Handle fetching data on initial page load and tab switch
	useEffect(() => {
		// Get account data
		getAccountConfig(activeTab);
	}, [activeTab, getAccountConfig]);

	// Handle SSE real-time data updates
	useEffect(() => {
		if (
			accountUpdateMessage &&
			accountUpdateMessage.event_name === "account-updated"
		) {
			// console.log("Received MT5 account real-time data:", accountUpdateMessage);

			// Update MT5 account data
			setMt5AccountData((prevData) => {
				// Match by terminal_id and id, update account data
				const updatedData = prevData.map((account) => {
					// If account_info is null, set terminal to disconnected, EA to closed
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

					// If account_info.account_id matches account.id, update account data
					if (
						accountUpdateMessage.account_config.id === account.id &&
						accountUpdateMessage.account_info
					) {
						// Update account data
						return {
							...account,
							// Update specific fields
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
							// Keep other fields unchanged
						};
					}
					// If no match, keep original data unchanged
					return account;
				});

				// console.log("Updated data:", updatedData);
				return updatedData;
			});
		}
	}, [accountUpdateMessage]);

	// Handle tab change
	const handleTabChange = (value: string) => {
		// Get corresponding account data based on selected tab
		setActiveTab(value);
		// Get corresponding account data based on selected tab
		getAccountConfigs(value);
	};

	// Handle add account
	const handleAddAccount = async (formData: any) => {
		console.log("Add account data:", formData);
		const { accountName, exchange, ...accountConfig } = formData;
		const res = await addAccountConfig(accountName, exchange, accountConfig);
		console.log("Successfully added account configuration:", res);
		if (res.code === 200) {
			// Refresh page
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

						{/* Add account button */}
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
