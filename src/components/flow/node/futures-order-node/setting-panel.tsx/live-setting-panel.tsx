import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateLiveConfig } from "@/hooks/node/futures-order-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import type { FuturesOrderConfig } from "@/types/order";
import type { SelectedAccount } from "@/types/strategy";
import FuturesOrderSetting from "../components/futures-order-setting";
import TradeAccountSelector from "../components/trade-account-selector";

const FuturesOrderNodeLiveSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	// 开始节点的实盘配置
	const { liveConfig: startNodeLiveConfig } = useStartNodeDataStore();

	// 获取节点数据
	const futuresOrderNodeData = data as FuturesOrderNodeData;

	// 使用hooks管理节点数据更新
	const { config, updateSelectedAccount, updateFuturesOrderConfigs } =
		useUpdateLiveConfig({
			id,
			initialConfig: futuresOrderNodeData?.liveConfig,
		});

	// 可选的账户列表
	const [accountList, setAccountList] = useState<SelectedAccount[]>(
		startNodeLiveConfig?.selectedAccounts || [],
	);
	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(config?.selectedAccount || null);

	// 当前的订单配置 - 从config中获取，保持同步
	const [orderConfigs, setOrderConfigs] = useState<FuturesOrderConfig[]>(
		config?.futuresOrderConfigs || [],
	);

	// 当开始节点的实盘配置变化时，更新可选的账户列表
	useEffect(() => {
		setAccountList(startNodeLiveConfig?.selectedAccounts || []);
	}, [startNodeLiveConfig]);

	// 当config变化时，同步更新本地状态
	useEffect(() => {
		if (config) {
			setSelectedAccount(config.selectedAccount || null);
			setOrderConfigs(config.futuresOrderConfigs || []);
		}
	}, [config]);

	// 处理账户选择变更
	const handleAccountChange = (account: SelectedAccount) => {
		setSelectedAccount(account);
		updateSelectedAccount(account);
	};

	// 处理订单配置变更
	const handleOrderConfigsChange = (newOrderConfigs: FuturesOrderConfig[]) => {
		setOrderConfigs(newOrderConfigs);
		updateFuturesOrderConfigs(newOrderConfigs);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col items-start justify-start gap-2 p-2">
				<label className="text-sm font-bold text-gray-700">交易账户</label>
				<TradeAccountSelector
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="p-2">
				<FuturesOrderSetting
					nodeId={id}
					orderConfigs={orderConfigs}
					onOrderConfigsChange={handleOrderConfigsChange}
				/>
			</div>
		</div>
	);
};

export default FuturesOrderNodeLiveSettingPanel;
