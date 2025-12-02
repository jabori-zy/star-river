import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	isSelectedIndicator,
	isSelectedSymbol,
	isVariableConfig,
	renderVariableOptions as renderVariableOptionsUtil,
} from "@/components/flow/node/node-utils";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { cn } from "@/lib/utils";
import type { Variable } from "@/types/node/if-else-node";
import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";

interface VariableSelectorProps {
	variableItemList: VariableItem[];
	variable: Variable | null;
	onNodeChange: (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => void; // 节点选择回调
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		varValueType: VariableValueType,
	) => void; // 变量选择回调
	whitelistValueType?: VariableValueType | null; // 可选：白名单 - 只保留指定类型
	blacklistValueType?: VariableValueType | null; // 可选：黑名单 - 排除指定类型
	excludeVariable?: {
		// 可选：排除特定变量（用于避免变量与自身比较）
		nodeId: string;
		outputHandleId: string;
		varName: string | number;
	} | null;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
	variableItemList,
	variable,
	onNodeChange,
	onVariableChange,
	whitelistValueType,
	blacklistValueType,
	excludeVariable,
}) => {
	const [selectedNodeId, setSelectedNodeId] = useState<string>(
		variable?.nodeId || "",
	);
	const [variableString, setVariableString] = useState<string>("");
	const { t } = useTranslation();
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

	// 检查某个节点是否有可用变量
	const nodeHasAvailableVariables = useCallback(
		(nodeId: string) => {
			const node = variableItemList.find((item) => item.nodeId === nodeId);
			if (!node) return false;

			const options = renderVariableOptionsUtil({
				variables: node.variables,
				localNodeId: nodeId,
				generateOptionValue,
				t,
				whitelistValueType,
				blacklistValueType,
				excludeVariable,
			});
			return options && options.length > 0;
		},
		[
			variableItemList,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		],
	);

	// 获取过滤后的节点列表（只包含有可用变量的节点）
	const filteredVariableItemList = useMemo(() => {
		return variableItemList.filter((item) =>
			nodeHasAvailableVariables(item.nodeId),
		);
	}, [variableItemList, nodeHasAvailableVariables]);

	// 当传入的variable发生变化时，同步更新本地状态
	useEffect(() => {
		if (variable) {
			// 更新选中的节点ID
			setSelectedNodeId(variable.nodeId || "");

			// 更新变量字符串
			if (variable.nodeId && variable.outputHandleId && variable.varName) {
				// 注意：这里 varName 是 variable，varDisplayName 是 variableName
				const variableString = generateOptionValue(
					variable.nodeId,
					variable.outputHandleId,
					variable.varName,
					variable.varDisplayName,
				);
				setVariableString(variableString);
			} else {
				setVariableString("");
			}
		} else {
			// 如果variable为null，清空状态
			setSelectedNodeId("");
			setVariableString("");
		}
	}, [variable, generateOptionValue]);

	// 当过滤条件变化导致当前选中的节点被过滤掉时，清除选择
	useEffect(() => {
		if (selectedNodeId && !nodeHasAvailableVariables(selectedNodeId)) {
			setSelectedNodeId("");
			setVariableString("");
			onNodeChange("", null, "");
		}
	}, [selectedNodeId, nodeHasAvailableVariables, onNodeChange]);

	// 处理节点选择
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find(
			(item) => item.nodeId === nodeId,
		)?.nodeType;
		// console.log("🔍 节点选择:", {
		// 	nodeId,
		// 	nodeName: variableItemList.find((item) => item.nodeId === nodeId)
		// 		?.nodeName,
		// 	nodeType: variableItemList.find((item) => item.nodeId === nodeId)
		// 		?.nodeType,
		// });
		setSelectedNodeId(nodeId);
		// 清空当前选择
		onNodeChange(
			nodeId,
			nodeType || null,
			variableItemList.find((item) => item.nodeId === nodeId)?.nodeName || "",
		);
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
		let varValueType = VariableValueType.NUMBER; // 默认为 NUMBER 类型

		if (selectedVar) {
			variableId = selectedVar.configId;

			// 根据变量类型获取 varValueType
			if (isVariableConfig(selectedVar)) {
				// 变量节点：从配置中获取
				varValueType = selectedVar.varValueType;
			} else if (
				isSelectedIndicator(selectedVar) ||
				isSelectedSymbol(selectedVar)
			) {
				// 指标节点和K线节点：都是 NUMBER 类型
				varValueType = VariableValueType.NUMBER;
			}
		}

		setVariableString(variableValue);
		onVariableChange(
			variableId,
			outputHandleId,
			variable,
			variableName || variable,
			varValueType,
		);
	};

	// 获取选中节点的变量列表
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		return selectedNode?.variables || [];
	};

	// 检查当前选中节点是否有可用变量
	const hasAvailableVariables = () => {
		const variables = getSelectedNodeVariables();
		const options = renderVariableOptionsUtil({
			variables,
			localNodeId: selectedNodeId,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		});
		return options && options.length > 0;
	};

	// 渲染变量选项或空状态提示
	const renderVariableContent = () => {
		const variables = getSelectedNodeVariables();
		const options = renderVariableOptionsUtil({
			variables,
			localNodeId: selectedNodeId,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		});
		// 如果没有可用变量，显示提示信息
		if (!options || options.length === 0) {
			return (
				<div className="py-2 text-center text-sm text-muted-foreground">
					{t("ifElseNode.noAvailableVariables")}
				</div>
			);
		}

		return options;
	};

	// 获取变量选择器的 placeholder
	const getVariablePlaceholder = () => {
		if (!selectedNodeId) {
			return t("ifElseNode.selectVariable");
		}
		return hasAvailableVariables()
			? t("ifElseNode.selectVariable")
			: t("ifElseNode.noAvailableVariables");
	};

	return (
		<ButtonGroup className="w-full">
			{/* 节点选择器 */}
			<Select value={selectedNodeId} onValueChange={handleNodeChange}>
				<SelectTrigger
					className={cn(
						"h-8 text-xs font-normal min-w-20 flex-1 bg-transparent hover:bg-gray-200 border-gray-300 transition-colors",
					)}
				>
					<SelectValue
						placeholder={t("ifElseNode.selectNode")}
						className="truncate"
					/>
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{filteredVariableItemList.length === 0 ? (
						<div className="py-2 text-center text-sm text-muted-foreground">
							无可用节点
						</div>
					) : (
						filteredVariableItemList.map((item) => (
							<SelectItem
								key={item.nodeId}
								value={item.nodeId}
								className="text-xs font-normal py-2 px-3"
								textValue={item.nodeName}
							>
								<div className="flex items-center gap-1">
									<span className="font-medium text-gray-900">
										{item.nodeName}
									</span>
								</div>
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>

			{/* 变量选择器 */}
			<Select
				value={variableString}
				onValueChange={handleVariableChange}
				disabled={!selectedNodeId}
			>
				<SelectTrigger
					className={cn(
						"h-8 text-xs font-normal min-w-20 flex-1 bg-transparent hover:bg-gray-200 border-gray-300 transition-colors",
						!selectedNodeId &&
							"opacity-50 cursor-not-allowed hover:bg-transparent",
					)}
				>
					<SelectValue
						placeholder={getVariablePlaceholder()}
						className="truncate"
					/>
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{renderVariableContent()}
				</SelectContent>
			</Select>
		</ButtonGroup>
	);
};

export default VariableSelector;
