import { useReactFlow } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { getOutputHandleIds } from "@/components/flow/node/futures-order-node/utils";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/futures-order-node";
import { useSymbolList } from "@/service/market/symbol-list";
import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	OrderType,
} from "@/types/order";
import type { SelectedAccount } from "@/types/strategy";
import OrderConfigForm from "../components/order-config-item";

const FuturesOrderNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();
	// Get start node data
	const { getStartNodeData, getTargetNodeIds } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList =
		startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	const { getNode, getEdges, setEdges } = useReactFlow();

	// Use new version hook to manage backtest config
	const {
		backtestConfig,
		updateExchangeModeConfig,
		updateFuturesOrderConfig,
		addFuturesOrderConfig,
		removeFuturesOrderConfig,
	} = useBacktestConfig({ id });
	const orderConfigs = backtestConfig?.futuresOrderConfigs || [];

	// Currently selected account
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(
			backtestConfig?.exchangeModeConfig?.selectedAccount || null,
		);

	// Confirm delete dialog state
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteConfig, setPendingDeleteConfig] =
		useState<FuturesOrderConfig | null>(null);
	const [pendingDeleteData, setPendingDeleteData] = useState<{
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	// Get symbol list (unified fetch in parent component to avoid duplicate requests in child components)
	const { data: symbolList = [] } = useSymbolList(selectedAccount?.id ?? 0);

	// Handle account selection change
	const handleAccountChange = (account: SelectedAccount) => {
		setSelectedAccount(account);

		// Update exchangeConfig
		const newExchangeConfig = {
			selectedAccount: account,
			timeRange: backtestConfig?.exchangeModeConfig?.timeRange || {
				startDate: "",
				endDate: "",
			},
		};

		updateExchangeModeConfig(newExchangeConfig);
	};

	// Handle single order config change
	const handleOrderConfigChange = (
		index: number,
		config: FuturesOrderConfig,
	) => {
		updateFuturesOrderConfig(index, config);
	};

	// Delete order config
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

		// If there are connected target nodes, show confirm dialog
		if (targetNodeIds.length > 0) {
			setPendingDeleteConfig(configToDelete);
			setPendingDeleteData({
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// No connected nodes, delete directly
		performDelete(index);
	};

	// Perform delete
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

		// Delete edges: inputHandleId + all outputHandleIds
		const inputHandleId = configToDelete.inputHandleId;
		const outputHandleIds = configToDelete.outputHandleIds || [];
		const edges = getEdges();
		const remainingEdges = edges.filter(
			(edge) =>
				edge.targetHandle !== inputHandleId &&
				!outputHandleIds.includes(edge.sourceHandle || ""),
		);
		setEdges(remainingEdges);

		// Delete config
		removeFuturesOrderConfig(targetIndex);

		// Clean up state
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

	// Add new order config
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
				<Label className="text-sm font-bold text-gray-700">
					{t("futuresOrderNode.orderConfig.orderConfigLabel")}
				</Label>
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
						{t("futuresOrderNode.addOrderConfigHint")}
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
								onChange={(updatedConfig) =>
									handleOrderConfigChange(index, updatedConfig)
								}
								onDelete={() => handleDeleteOrder(index)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Confirm delete dialog */}
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
