import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SelectedAccount } from "@/types/strategy";

interface OptAccountSelectorProps {
	accountList: SelectedAccount[];
	selectedAccount: SelectedAccount | null; // Currently selected account
	onAccountChange: (account: SelectedAccount) => void; // Account change callback
}

// Selected account list
const OptAccountSelector: React.FC<OptAccountSelectorProps> = ({
	accountList,
	selectedAccount,
	onAccountChange,
}) => {
	const [localSelectedAccount, setLocalSelectedAccount] =
		useState<SelectedAccount | null>(selectedAccount);
	const [hasAccounts, setHasAccounts] = useState<boolean>(
		accountList.length > 0,
	);

	useEffect(() => {
		if (selectedAccount) {
			setLocalSelectedAccount(selectedAccount);
		}
		// If account list is empty, set to false
		if (accountList.length === 0) {
			setHasAccounts(false);
		} else {
			setHasAccounts(true);
		}
	}, [selectedAccount, accountList]);

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
			<div className="text-sm font-bold">Operation Account</div>
			<Select
				disabled={!hasAccounts}
				value={localSelectedAccount?.id?.toString() || ""}
				onValueChange={handleAccountChange}
			>
				<SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
					<SelectValue
						placeholder={hasAccounts ? "Select Account" : "No Account Configured"}
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
				<p className="text-xs text-gray-500 mt-1">Configure in strategy start node</p>
			)}
		</div>
	);
};

export default OptAccountSelector;
