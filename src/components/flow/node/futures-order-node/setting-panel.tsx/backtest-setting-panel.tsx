import { useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Label } from "@/components/ui/label";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import { type FuturesOrderConfig, FuturesOrderSide, OrderType } from "@/types/order";
import type { SelectedAccount } from "@/types/strategy";
import OrderConfigForm from "../components/order-config-item";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import AccountSelector from "@/components/flow/account-selector";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useSymbolList } from "@/service/market/symbol-list";
import { useTranslation } from "react-i18next";
const FuturesOrderNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();
	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// ✅ 使用新版本 hook 管理回测配置
	const {
		backtestConfig,
		updateExchangeModeConfig,
		updateFuturesOrderConfig,
		addFuturesOrderConfig,
		removeFuturesOrderConfig,
	} = useBacktestConfig({ id });
	const orderConfigs = backtestConfig?.futuresOrderConfigs || [];

	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(
			backtestConfig?.exchangeModeConfig?.selectedAccount || null,
		);

	// 获取代币列表（在父组件统一获取，避免子组件重复请求）
	const { data: symbolList = [] } = useSymbolList(selectedAccount?.id ?? 0);

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

	// 处理单个订单配置变更
	const handleOrderConfigChange = (index: number, config: FuturesOrderConfig) => {
		updateFuturesOrderConfig(index, config);
	};

	// 删除订单配置
	const handleDeleteOrder = (index: number) => {
		removeFuturesOrderConfig(index);
	};

	// 添加新订单配置
	const handleAddOrder = () => {
		const newOrderConfigId = orderConfigs.length + 1;
		const newOrderConfig: FuturesOrderConfig = {
			orderConfigId: newOrderConfigId,
			inputHandleId: `${id}_input_${newOrderConfigId}`,
			symbol: "",
			orderType: OrderType.LIMIT,
			orderSide: FuturesOrderSide.LONG,
			price: 0,
			quantity: 0,
			tp: null,
			sl: null,
			tpType: "price",
			slType: "price",
			triggerConfig: null,
		};
		addFuturesOrderConfig(newOrderConfig);
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
				<AccountSelector
					label={t("futuresOrderNode.tradingAccount")}
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="flex items-center justify-between px-2">
				<Label className="text-sm font-bold text-gray-700">{t("futuresOrderNode.orderConfig.orderConfigLabel")}</Label>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleAddOrder}
					disabled={!selectedAccount?.id}
				>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="px-2">
				{orderConfigs.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						点击+号添加订单配置
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{orderConfigs.map((config, index) => (
							<OrderConfigForm
								id={id}
								key={config.orderConfigId}
								accountId={selectedAccount?.id}
								nodeId={id}
								config={config}
								orderConfigId={config.orderConfigId}
								symbolList={symbolList}
								onChange={(updatedConfig) => handleOrderConfigChange(index, updatedConfig)}
								onDelete={() => handleDeleteOrder(index)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default FuturesOrderNodeBacktestSettingPanel;
