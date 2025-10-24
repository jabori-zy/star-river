import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	renderNodeOptions,
	renderVariableOptions,
} from "@/components/flow/node/node-utils";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { NodeType } from "@/types/node/index";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type {
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generateStringHint,
	generateTimeHint,
	generatePercentageHint,
} from "../../../../hint-generators";
import { getUpdateOperationLabel } from "@/types/node/variable-node/variable-operation-types";

interface DataFlowSelectorProps {
	variableItemList: VariableItem[];
	selectedNodeId: string | null;
	selectedHandleId: string | null;
	selectedVariable: string | null;
	selectedVariableName: string | null;
	updateOperationType: UpdateVarValueOperation;
	availableOperations: UpdateVarValueOperation[];
	targetVariableType?: VariableValueType; // 目标变量的类型，用于过滤数据流变量
	targetVariableDisplayName?: string; // 目标变量的显示名称，用于提示文案
	onNodeChange: (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => void;
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		variableValueType: VariableValueType,
	) => void;
	onOperationTypeChange: (operationType: UpdateVarValueOperation) => void;
}

// 类型守卫 - 用于判断变量类型
const isVariableConfig = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is VariableConfig => {
	return "varOperation" in variable;
};

const isSelectedIndicator = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedIndicator => {
	return (
		"value" in variable && "configId" in variable && "indicatorType" in variable
	);
};

const isSelectedSymbol = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedSymbol => {
	return (
		"symbol" in variable && "interval" in variable && "configId" in variable
	);
};

const DataFlowSelector: React.FC<DataFlowSelectorProps> = ({
	variableItemList,
	selectedNodeId,
	selectedHandleId,
	selectedVariable,
	selectedVariableName,
	updateOperationType,
	availableOperations,
	targetVariableType,
	targetVariableDisplayName,
	onNodeChange,
	onVariableChange,
	onOperationTypeChange,
}) => {
	const [localNodeId, setLocalNodeId] = useState<string>(selectedNodeId || "");
	const [variableString, setVariableString] = useState<string>("");
	const { t, i18n } = useTranslation();
	const language = i18n.language;

	// 生成选项value，格式：nodeId|handleId|variable|variableName
	const generateOptionValue = useCallback(
		(
			nodeId: string,
			handleId: string,
			variable: string | number,
			variableName?: string | null,
		) => {
			if (variableName) {
				return `${nodeId}|${handleId}|${variable}|${variableName}`;
			}
			return `${nodeId}|${handleId}||${variable}`;
		},
		[],
	);

	// 同步节点选择状态
	useEffect(() => {
		setLocalNodeId(selectedNodeId || "");
	}, [selectedNodeId]);

	// 同步变量选择状态
	useEffect(() => {
		if (selectedNodeId && selectedHandleId && selectedVariable) {
			const variableString = generateOptionValue(
				selectedNodeId,
				selectedHandleId,
				selectedVariable,
				selectedVariableName,
			);
			setVariableString(variableString);
		} else {
			setVariableString("");
		}
	}, [
		selectedNodeId,
		selectedHandleId,
		selectedVariable,
		selectedVariableName,
		generateOptionValue,
	]);

	// 处理节点选择
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find(
			(item) => item.nodeId === nodeId,
		)?.nodeType;
		const nodeName =
			variableItemList.find((item) => item.nodeId === nodeId)?.nodeName || "";
		setLocalNodeId(nodeId);
		setVariableString(""); // 清空变量选择
		onNodeChange(nodeId, nodeType || null, nodeName);
	};

	// 处理变量选择
	const handleVariableChange = (variableValue: string) => {
		const [nodeId, outputHandleId, variable, variableName] =
			variableValue.split("|");

		const selectedNode = variableItemList.find(
			(item) => item.nodeId === nodeId,
		);
		const selectedVar = selectedNode?.variables.find(
			(v) => v.outputHandleId === outputHandleId,
		);

		let variableId = 0;
		let variableValueType = VariableValueType.NUMBER; // 默认为 NUMBER 类型

		if (selectedVar) {
			variableId = selectedVar.configId;

			// 根据变量类型获取 varValueType
			if (isVariableConfig(selectedVar)) {
				// 变量节点：从配置中获取
				variableValueType = selectedVar.varValueType;
			} else if (
				isSelectedIndicator(selectedVar) ||
				isSelectedSymbol(selectedVar)
			) {
				// 指标节点和K线节点：都是 NUMBER 类型
				variableValueType = VariableValueType.NUMBER;
			}
		}

		setVariableString(variableValue);
		onVariableChange(
			variableId,
			outputHandleId,
			variable,
			variableName || variable,
			variableValueType,
		);
	};

	// 获取选中节点的变量列表
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === localNodeId,
		);
		return selectedNode?.variables || [];
	};

	// 过滤节点列表：只保留有有效变量的节点
	const getFilteredNodeList = useCallback(() => {
		// console.log("variableItemList", variableItemList);
		if (!targetVariableType) {
			return variableItemList;
		}

		return variableItemList.filter((item) => {
			
			// 检查该节点是否有任何变量匹配目标类型
			const hasValidVariable = item.variables.some((v) => {
				// 指标节点和K线节点都是 NUMBER 类型
				if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
					return targetVariableType === VariableValueType.NUMBER;
				}
				// 变量节点根据其具体类型过滤
				if (isVariableConfig(v)) {
					return v.varValueType === targetVariableType;
				}
				return false;
			});

			return hasValidVariable;
		});
	}, [variableItemList, targetVariableType]);

	const filteredNodeList = getFilteredNodeList();
	const hasNoNodes = filteredNodeList.length === 0;

	// 检查当前选中的节点是否在过滤后的列表中
	const isSelectedNodeInFilteredList = filteredNodeList.some(
		(item) => item.nodeId === localNodeId,
	);

	// 如果当前选中的节点不在过滤后的列表中，使用空字符串作为value
	const nodeSelectValue = isSelectedNodeInFilteredList ? localNodeId : "";

	// 根据变量类型选择对应的生成器
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint;

		const generatorMap = {
			[VariableValueType.BOOLEAN]: generateBooleanHint,
			[VariableValueType.ENUM]: generateEnumHint,
			[VariableValueType.NUMBER]: generateNumberHint,
			[VariableValueType.STRING]: generateStringHint,
			[VariableValueType.TIME]: generateTimeHint,
			[VariableValueType.PERCENTAGE]: generatePercentageHint,
		};

		return generatorMap[varValueType] || generateNumberHint;
	};

	// 生成提示文案
	const generateHintText = (): React.ReactNode => {
		if (!selectedNodeId || !selectedHandleId || !selectedVariable || !selectedVariableName) {
			return null;
		}

		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		if (!selectedNode) {
			return null;
		}

		const fromNodeName = selectedNode.nodeName;
		const fromNodeType = selectedNode.nodeType;
		const fromVarDisplayName = selectedVariableName;

		// 获取变量配置ID和变量类型
		const selectedVar = selectedNode.variables.find(
			(v) => v.outputHandleId === selectedHandleId,
		);
		if (!selectedVar) {
			return null;
		}
		const fromVarConfigId = selectedVar.configId;

		// 获取变量值类型
		let fromVarValueType: VariableValueType;
		if (isVariableConfig(selectedVar)) {
			fromVarValueType = selectedVar.varValueType;
		} else if (
			isSelectedIndicator(selectedVar) ||
			isSelectedSymbol(selectedVar)
		) {
			fromVarValueType = VariableValueType.NUMBER;
		} else {
			fromVarValueType = VariableValueType.NUMBER;
		}

		// 使用新的 hint 生成器
		return getHintGenerator(targetVariableType)({
			t,
			language,
			varOperation: "update",
			operationType: updateOperationType,
			variableDisplayName: targetVariableDisplayName,
			dataflowTrigger: {
				fromNodeType,
				fromNodeId: selectedNodeId,
				fromNodeName,
				fromHandleId: selectedHandleId,
				fromVar: selectedVariable,
				fromVarDisplayName,
				fromVarValueType,
				fromVarConfigId,
				expireDuration: { unit: "hour", duration: 1 },
				errorPolicy: {},
			},
		});
	};

	return (
		<div className="flex flex-col gap-2">
			<ButtonGroup className="w-full">
				{/* 操作符选择器 */}
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value: string) => {
						onOperationTypeChange(value as UpdateVarValueOperation);
					}}
					options={availableOperations.map((op) => ({
						value: op,
						label: getUpdateOperationLabel(op, t),
					}))}
					className="w-[70px] h-8"
				/>

				{/* 节点选择器 */}
				<SelectInDialog
					value={nodeSelectValue}
					onValueChange={handleNodeChange}
					placeholder={hasNoNodes ? t("variableNode.dataflowSelector.noNodes") : t("variableNode.dataflowSelector.chooseNode")}
					options={renderNodeOptions(filteredNodeList)}
					disabled={hasNoNodes}
					className="h-8 text-xs font-normal min-w-20 flex-1"
				/>

				{/* 变量选择器 */}
				<SelectInDialog
					value={variableString}
					onValueChange={handleVariableChange}
					placeholder={hasNoNodes ? t("variableNode.dataflowSelector.noVariables") : t("variableNode.dataflowSelector.chooseVariable")}
					disabled={!localNodeId || hasNoNodes}
					className="h-8 text-xs font-normal min-w-20 flex-1"
				>
					{renderVariableOptions({
						variables: getSelectedNodeVariables(),
						localNodeId,
						generateOptionValue,
						t,
						whitelistValueType: targetVariableType || null,
					})}
				</SelectInDialog>
			</ButtonGroup>

			{/* 提示文案 */}
			{generateHintText() && (
				<p className="text-xs text-muted-foreground">{generateHintText()}</p>
			)}
		</div>
	);
};

export default DataFlowSelector;
