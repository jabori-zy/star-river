import { useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Label } from "@/components/ui/label";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import type { FuturesOrderConfig } from "@/types/order";
import type { SelectedAccount } from "@/types/strategy";
import FuturesOrderSetting from "../components/futures-order-setting";
import TradeAccountSelector from "../components/trade-account-selector";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";

const FuturesOrderNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];
	console.log("accountList", accountList);

	// ✅ 使用新版本 hook 管理回测配置
	const { backtestConfig, updateExchangeModeConfig, updateFuturesOrderConfigs } = useBacktestConfig({ id });
	const orderConfigs = backtestConfig?.futuresOrderConfigs || [];

	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(
			backtestConfig?.exchangeModeConfig?.selectedAccount || null,
		);

	// 处理账户选择变更
	const handleAccountChange = (account: SelectedAccount) => {
		setSelectedAccount(account);

		// 更新exchangeConfig
		const newExchangeConfig = {
			selectedAccount: account,
			timeRange: backtestConfig?.exchangeModeConfig?.timeRange || {
				startDate: "",
				endDate: "",
			},
		};

		updateExchangeModeConfig(newExchangeConfig);
	};

	// 处理订单配置变更
	const handleOrderConfigsChange = (newOrderConfigs: FuturesOrderConfig[]) => {
		updateFuturesOrderConfigs(newOrderConfigs);
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
			<div className="flex flex-col items-start justify-start gap-2 p-2">
				<Label
					htmlFor="trade-account-selector"
					className="text-sm font-bold text-gray-700"
				>
					交易账户
				</Label>
				<TradeAccountSelector
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="p-2">
				<FuturesOrderSetting
					nodeId={id}
					accountId={selectedAccount?.id}
					orderConfigs={orderConfigs}
					onOrderConfigsChange={handleOrderConfigsChange}
				/>
			</div>
			</div>
		</div>
	);
};

export default FuturesOrderNodeBacktestSettingPanel;
