"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "@/types/account";
import { AddAccountPanel } from "./add-account-panel";
import { mt5FormConfig } from "./add-account-panel/mt5-form-config";
import { binanceFormConfig } from "./add-account-panel/binance-form-config";

interface AccountsHeaderProps {
	activeTab: string;
	onAddAccount: (accountData: Partial<Account>) => void;
}

export function AccountsHeader({
	activeTab,
	onAddAccount,
}: AccountsHeaderProps) {
	const handleAddAccount = (values: Partial<Account>) => {
		console.log("添加账户数据:", values);
		onAddAccount({
			...values,
			exchange: activeTab,
		});
	};

	const getAddButtonConfig = () => {
		switch (activeTab) {
			case "metatrader5":
				return {
					formConfig: mt5FormConfig,
					label: "添加MT5账户",
				};
			case "binance":
				return {
					formConfig: binanceFormConfig, // 暂时使用MT5配置
					label: "添加Binance账户",
				};
			case "okx":
				return {
					formConfig: mt5FormConfig, // 暂时使用MT5配置
					label: "添加OKX账户",
				};
			default:
				return {
					formConfig: mt5FormConfig,
					label: "添加账户",
				};
		}
	};

	const { formConfig, label } = getAddButtonConfig();

	return (
		<div className="flex items-center justify-end mb-4">
			<AddAccountPanel
				{...formConfig}
				onSubmit={handleAddAccount}
				trigger={
					<Button variant="outline" size="sm">
						<PlusIcon className="mr-2 h-4 w-4" />
						<span>{label}</span>
					</Button>
				}
			/>
		</div>
	);
}
