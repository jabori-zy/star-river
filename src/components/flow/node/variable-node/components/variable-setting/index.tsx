import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow, {
	type VariableItem,
} from "@/hooks/flow/use-strategy-workflow";
import { getSymbolList } from "@/service/market";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { MarketSymbol } from "@/types/market";
import type { VariableConfig } from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import VariableConfigDialog from "./variable-config-dialog";
import VariableConfigItem from "./variable-config-item";

interface VariableSettingProps {
	id: string;
	tradeMode: TradeMode;
	variableConfigs: VariableConfig[];
	onVariableConfigsChange: (variableConfigs: VariableConfig[]) => void;
}

const VariableSetting: React.FC<VariableSettingProps> = ({
	id,
	tradeMode,
	variableConfigs,
	onVariableConfigsChange,
}) => {
	const {
		backtestConfig: startNodeBacktestConfig,
		liveConfig: startNodeLiveConfig,
	} = useStartNodeDataStore();

	// 本地状态管理
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteVariable, setPendingDeleteVariable] =
		useState<VariableConfig | null>(null);
	const [pendingVariableData, setPendingVariableData] = useState<{
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	const {
		getTargetNodeIdsBySourceHandleId,
		getConnectedNodeVariables,
		getIfElseNodeCases,
	} = useStrategyWorkflow();
	const { getNode, getEdges, setEdges } = useReactFlow();

	const connections = useNodeConnections({ id, handleType: "target" });

	// 存储上游节点的变量列表
	const [variableItemList, setVariableItemList] = React.useState<
		VariableItem[]
	>([]);
	// 存储上游节点的case列表
	const [caseItemList, setCaseItemList] = React.useState<any[]>([]);

	useEffect(() => {
		// 获取连接节点的变量并更新状态
		const variables = getConnectedNodeVariables(connections, tradeMode);
		const cases = getIfElseNodeCases(connections, tradeMode);
		console.log("收集到的所有cases列表", cases);
		setVariableItemList(variables);
		setCaseItemList(cases);
	}, [
		connections,
		getConnectedNodeVariables,
		getIfElseNodeCases,
		id,
		tradeMode,
	]);

	const selectedAccountId = useMemo(() => {
		if (tradeMode === TradeMode.BACKTEST) {
			return (
				startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts?.[0]
					?.id ?? undefined
			);
		}

		if (tradeMode === TradeMode.LIVE) {
			return startNodeLiveConfig?.selectedAccounts?.[0]?.id ?? undefined;
		}

		return undefined;
	}, [tradeMode, startNodeBacktestConfig, startNodeLiveConfig]);

	const [symbolList, setSymbolList] = useState<MarketSymbol[]>([]);
	const [isSymbolLoading, setIsSymbolLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (!selectedAccountId) {
			setSymbolList((prev) => (prev.length === 0 ? prev : []));
			setIsSymbolLoading(false);
			return () => {
				cancelled = true;
			};
		}

		const fetchSymbols = async () => {
			setIsSymbolLoading(true);
			try {
				const data = await getSymbolList(selectedAccountId);
				if (!cancelled) {
					setSymbolList(data);
				}
			} catch (error) {
				console.error("获取交易对列表失败:", error);
				if (!cancelled) {
					setSymbolList([]);
				}
			} finally {
				if (!cancelled) {
					setIsSymbolLoading(false);
				}
			}
		};

		fetchSymbols();

		return () => {
			cancelled = true;
		};
	}, [selectedAccountId]);

	const symbolOptions = useMemo(
		() =>
			symbolList.map((symbol) => ({
				value: symbol.name,
				label: symbol.name,
			})),
		[symbolList],
	);

	const symbolPlaceholder = useMemo(() => {
		if (!selectedAccountId) {
			return "请先选择账户";
		}
		if (isSymbolLoading) {
			return "加载中...";
		}
		return "选择交易对";
	}, [selectedAccountId, isSymbolLoading]);

	const symbolEmptyMessage = useMemo(
		() => (selectedAccountId ? "未找到交易对" : "未选择账户"),
		[selectedAccountId],
	);

	const handleAddVariable = () => {
		setIsEditing(false);
		setEditingIndex(null);
		setIsDialogOpen(true);
	};

	const handleEditVariable = (index: number) => {
		setIsEditing(true);
		setEditingIndex(index);
		setIsDialogOpen(true);
	};

	const handleDeleteVariable = (index: number) => {
		const variableToDelete = variableConfigs[index];
		const targetNodeIds = getTargetNodeIdsBySourceHandleId(
			variableToDelete.outputHandleId,
		);

		const targetNodeNames = [
			...new Set(
				targetNodeIds
					.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
					.filter(Boolean),
			),
		];

		// 如果有连接的目标节点，显示确认对话框
		if (targetNodeIds.length > 0) {
			setPendingDeleteVariable(variableToDelete);
			setPendingVariableData({
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
				: variableConfigs.findIndex(
						(variable) =>
							pendingDeleteVariable &&
							variable.configId === pendingDeleteVariable.configId,
					);

		if (targetIndex === -1) return;

		const variableToDelete = variableConfigs[targetIndex];

		// 删除边
		const sourceHandleId = variableToDelete.outputHandleId;
		const targetHandleId = variableToDelete.inputHandleId;
		const edges = getEdges();
		const remainingEdges = edges.filter(
			(edge) =>
				edge.sourceHandle !== sourceHandleId &&
				edge.targetHandle !== targetHandleId,
		);
		console.log("remainingEdges", remainingEdges);
		setEdges(remainingEdges);

		const updatedVariables = variableConfigs
			.filter((_, i) => i !== targetIndex)
			.map((variable, newIndex) => ({
				...variable,
				configId: newIndex + 1, // 重新分配id，保持连续性
				inputHandleId: `${id}_input_${newIndex + 1}`,
				outputHandleId: `${id}_output_${newIndex + 1}`,
			}));
		onVariableConfigsChange(updatedVariables);

		// 清理删除相关状态
		setPendingDeleteVariable(null);
		setIsConfirmDialogOpen(false);
		setPendingVariableData(null);
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		// 关闭确认对话框并清理状态
		setIsConfirmDialogOpen(false);
		setPendingDeleteVariable(null);
		setPendingVariableData(null);
	};

	// 检查交易对+变量类型+触发方式的唯一性（仅对 get 操作）
	const checkUniqueness = (
		symbol: string | null,
		variable: string,
		triggerType: "condition" | "timer",
		excludeIndex?: number,
	) => {
		return !variableConfigs.some(
			(config, index) =>
				index !== excludeIndex &&
				config.varOperation === "get" && // 只检查 get 操作
				(config.symbol || "") === (symbol || "") &&
				config.varName === variable &&
				config.varTriggerType === triggerType,
		);
	};

	const handleSave = (id: string, variableConfig: VariableConfig) => {
		// 只对 get 操作检查唯一性
		if (variableConfig.varOperation === "get") {
			if (
				!checkUniqueness(
					variableConfig.symbol || null,
					variableConfig.varName,
					variableConfig.varTriggerType,
					isEditing ? editingIndex || undefined : undefined,
				)
			) {
				// 如果不唯一，可以在这里显示错误信息
				// alert("相同交易对、变量类型和触发方式的配置已存在！");
				return;
			}
		}

		if (isEditing && editingIndex !== null) {
			const updatedVariables = [...variableConfigs];
			updatedVariables[editingIndex] = variableConfig;
			onVariableConfigsChange(updatedVariables);
		} else {
			// 新增变量时，设置id为当前列表长度+1
			const newVariableConfig = {
				...variableConfig,
				configId: variableConfigs.length + 1,
				inputHandleId: `${id}_input_${variableConfigs.length + 1}`,
				outputHandleId: `${id}_output_${variableConfigs.length + 1}`,
			};
			onVariableConfigsChange([...variableConfigs, newVariableConfig]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-bold text-gray-700">变量配置</Label>
				<Button variant="ghost" size="icon" onClick={handleAddVariable}>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="space-y-2">
				{variableConfigs.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						点击+号添加变量配置
					</div>
				) : (
					variableConfigs.map((config, index) => (
						<VariableConfigItem
							key={config.configId}
							config={config}
							index={index}
							onEdit={handleEditVariable}
							onDelete={handleDeleteVariable}
						/>
					))
				)}
			</div>

			<VariableConfigDialog
				id={id}
				isOpen={isDialogOpen}
				isEditing={isEditing}
				editingConfig={
					editingIndex !== null ? variableConfigs[editingIndex] : undefined
				}
				onOpenChange={setIsDialogOpen}
				onSave={handleSave}
				existingConfigs={variableConfigs}
				editingIndex={editingIndex}
				variableItemList={variableItemList}
				caseItemList={caseItemList}
				symbolOptions={symbolOptions}
				symbolPlaceholder={symbolPlaceholder}
				symbolEmptyMessage={symbolEmptyMessage}
				isSymbolSelectorDisabled={!selectedAccountId}
			/>

			{/* 确认删除对话框 */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingVariableData?.targetNodeCount || 0}
				affectedNodeNames={pendingVariableData?.targetNodeNames || []}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				operationType="delete"
			/>
		</div>
	);
};

export default VariableSetting;
