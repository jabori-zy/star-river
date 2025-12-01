import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import AccountSelector from "@/components/flow/account-selector";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBacktestConfig } from "@/hooks/node-config/position-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSymbolList } from "@/service/market/symbol-list";
import {
	PositionOperation,
	type PositionOperationConfig,
} from "@/types/node/position-node";
import type { SelectedAccount } from "@/types/strategy";
import PositionOpItem from "../components/position-op-item";
import { getOutputHandleIds } from "../utils";

const PositionNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();
	// 获取开始节点数据
	const { getStartNodeData, getTargetNodeIds } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	const { getNode, getEdges, setEdges } = useReactFlow();

	const {
		backtestConfig,
		updateSelectedAccount,
		addPositionOperation,
		updatePositionOperation,
		removePositionOperation,
	} = useBacktestConfig({ id });

	const operationConfigs = backtestConfig?.positionOperations || [];

	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(backtestConfig?.selectedAccount || null);

	// 确认删除对话框状态
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteConfig, setPendingDeleteConfig] =
		useState<PositionOperationConfig | null>(null);
	const [pendingDeleteData, setPendingDeleteData] = useState<{
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	const { data: symbolList = [] } = useSymbolList(selectedAccount?.id ?? 0);

	useEffect(() => {
		if (backtestConfig) {
			setSelectedAccount(backtestConfig.selectedAccount || null);
		}
	}, [backtestConfig]);

	const handleAccountChange = (account: SelectedAccount | null) => {
		setSelectedAccount(account);
		updateSelectedAccount(account);
	};

	const handleOperationConfigChange = (
		index: number,
		config: PositionOperationConfig,
	) => {
		updatePositionOperation(index, config);
	};

	const handleDeleteOperation = (index: number) => {
		const configToDelete = operationConfigs[index];
		const targetNodeIds = getTargetNodeIds(id);

		const targetNodeNames = targetNodeIds
			.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
			.filter(Boolean);

		if (targetNodeIds.length > 0) {
			setPendingDeleteConfig(configToDelete);
			setPendingDeleteData({
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		performDelete(index);
	};

	// 执行删除
	const performDelete = (index?: number) => {
		const targetIndex =
			index !== undefined
				? index
				: operationConfigs.findIndex(
						(config) =>
							pendingDeleteConfig &&
							config.configId === pendingDeleteConfig.configId,
					);

		if (targetIndex === -1) return;

		const configToDelete = operationConfigs[targetIndex];

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
		removePositionOperation(targetIndex);

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

	const handleAddOperation = () => {
		const newConfigId = operationConfigs.length + 1;
		const newConfig: PositionOperationConfig = {
			configId: newConfigId,
			inputHandleId: `${id}_input_${newConfigId}`,
			outputHandleIds: getOutputHandleIds(id, newConfigId),
			symbol: null,
			positionOperation: PositionOperation.CLOSE_POSITION,
			operationName: "Close Position",
			triggerConfig: null,
		};
		addPositionOperation(newConfig);
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
				<AccountSelector
					label={t("positionNode.operationAccount")}
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="flex items-center justify-between px-2">
				<Label className="text-sm font-bold text-gray-700">
					{t("positionNode.operationConfig")}
				</Label>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleAddOperation}
					disabled={!selectedAccount?.id}
				>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="px-2 space-y-2">
				{operationConfigs.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{t("positionNode.emptyOperationHint")}
					</div>
				) : (
					operationConfigs.map((config, index) => (
						<PositionOpItem
							key={config.configId}
							id={id}
							config={config}
							symbolList={symbolList}
							onChange={(updatedConfig) =>
								handleOperationConfigChange(index, updatedConfig)
							}
							onDelete={() => handleDeleteOperation(index)}
						/>
					))
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

export default PositionNodeBacktestSettingPanel;
