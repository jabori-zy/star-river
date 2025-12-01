import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
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
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { getOutputHandleIds } from "@/components/flow/node/futures-order-node/utils";









const FuturesOrderNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();
	// 获取开始节点数据
	const { getStartNodeData, getTargetNodeIds } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	const { getNode, getEdges, setEdges } = useReactFlow();

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

	// 确认删除对话框状态
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteConfig, setPendingDeleteConfig] =
		useState<FuturesOrderConfig | null>(null);
	const [pendingDeleteData, setPendingDeleteData] = useState<{
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

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
		const configToDelete = orderConfigs[index];
		const targetNodeIds = getTargetNodeIds(id);

		const targetNodeNames = [
			...new Set(
				targetNodeIds
					.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
					.filter(Boolean),
			),
		];

		// 如果有连接的目标节点，显示确认对话框
		if (targetNodeIds.length > 0) {
			setPendingDeleteConfig(configToDelete);
			setPendingDeleteData({
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// 没有连接节点，直接删除
		performDelete(index);
	};

	// 执行删除
	const performDelete = (index?: number) => {
		const targetIndex =
			index !== undefined
				? index
				: orderConfigs.findIndex(
						(config) =>
							pendingDeleteConfig &&
							config.orderConfigId === pendingDeleteConfig.orderConfigId,
					);

		if (targetIndex === -1) return;

		const configToDelete = orderConfigs[targetIndex];

		// 删除边：inputHandleId + 所有 outputHandleIds
		const inputHandleId = configToDelete.inputHandleId;
		const outputHandleIds = configToDelete.outputHandleIds || [];
		const edges = getEdges();
		const remainingEdges = edges.filter(
			(edge) =>
				edge.targetHandle !== inputHandleId &&
				!outputHandleIds.includes(edge.sourceHandle || ""),
		);
		setEdges(remainingEdges);

		// 删除配置
		removeFuturesOrderConfig(targetIndex);

		// 清理状态
		setPendingDeleteConfig(null);
		setIsConfirmDialogOpen(false);
		setPendingDeleteData(null);
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		setIsConfirmDialogOpen(false);
		setPendingDeleteConfig(null);
		setPendingDeleteData(null);
	};

	// 添加新订单配置
	const handleAddOrder = () => {
		const newOrderConfigId = orderConfigs.length + 1;
		const orderType = OrderType.LIMIT;
		const newOrderConfig: FuturesOrderConfig = {
			orderConfigId: newOrderConfigId,
			inputHandleId: `${id}_input_${newOrderConfigId}`,
			outputHandleIds: getOutputHandleIds(id, newOrderConfigId, orderType),
			symbol: "",
			orderType: orderType,
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

			{/* 确认删除对话框 */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingDeleteData?.targetNodeCount || 0}
				affectedNodeNames={pendingDeleteData?.targetNodeNames || []}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				operationType="delete"
			/>
		</div>
	);
};

export default FuturesOrderNodeBacktestSettingPanel;
