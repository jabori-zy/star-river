"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "@/types/account";
import { AddAccountPanel } from "./add-account-panel";
import { binanceFormConfig } from "./add-account-panel/binance-form-config";
import { mt5FormConfig } from "./add-account-panel/mt5-form-config";

interface AccountsHeaderProps {
	activeTab: string;
	onAddAccount: (accountData: Partial<Account>) => void;
}

export function AccountsHeader({
	activeTab,
	onAddAccount,
}: AccountsHeaderProps) {
	const handleAddAccount = (values: Partial<Account>) => {
		console.log("Add account data:", values);
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
					label: "Add MT5 Account",
				};
			case "binance":
				return {
					formConfig: binanceFormConfig, // Temporarily using MT5 configuration
					label: "Add Binance Account",
				};
			case "okx":
				return {
					formConfig: mt5FormConfig, // Temporarily using MT5 configuration
					label: "Add OKX Account",
				};
			default:
				return {
					formConfig: mt5FormConfig,
					label: "Add Account",
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
