import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types/node/index";
import type { Variable } from "@/types/node/if-else-node";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { VariableConfig, GetVariableConfig } from "@/types/node/variable-node";
import { useTranslation } from "react-i18next";


interface VariableSelectorProps {
	variableItemList: VariableItem[];
	variable: Variable | null;
	onNodeChange: (nodeId: string, nodeType: NodeType | null, nodeName: string) => void; // 节点选择回调
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
	) => void; // 变量选择回调
}

// 类型守卫：判断是否为SelectedIndicator
const isSelectedIndicator = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedIndicator => {
	return "value" in variable && "configId" in variable;
};

// 类型守卫：判断是否为SelectedSymbol
const isSelectedSymbol = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedSymbol => {
	return (
		"symbol" in variable && "interval" in variable && "configId" in variable
	);
};

// 类型守卫：判断是否为VariableConfig
const isVariableConfig = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is VariableConfig => {
	return "configId" in variable && "variableName" in variable;
};

// 获取节点类型的显示名称
// const getNodeTypeDisplayName = (nodeType: NodeType): string => {
// 	const nodeTypeMap: Record<NodeType, string> = {
// 		[NodeType.StartNode]: "开始",
// 		[NodeType.KlineNode]: "K线",
// 		[NodeType.IndicatorNode]: "指标",
// 		[NodeType.IfElseNode]: "条件",
// 		[NodeType.FuturesOrderNode]: "期货订单",
// 		[NodeType.PositionManagementNode]: "仓位管理",
// 		[NodeType.VariableNode]: "变量",
// 	};
// 	return nodeTypeMap[nodeType] || nodeType;
// };

const VariableSelector: React.FC<VariableSelectorProps> = ({
	variableItemList,
	variable,
	onNodeChange,
	onVariableChange,
}) => {
	const [selectedNodeId, setSelectedNodeId] = useState<string>(
		variable?.nodeId || "",
	);
	const [variableString, setVariableString] = useState<string>("");
	const { t } = useTranslation();
	// 生成选项value，格式：nodeId|handleId|valueKey
	const generateOptionValue = useCallback(
		(nodeId: string, handleId: string, variable: string | number, variableName?: string | null) => {
			if (variableName) {
				return `${nodeId}|${handleId}|${variableName}|${variable}`;
			}
			return `${nodeId}|${handleId}|""|${variable}`;
		},
		[],
	);

	// 当传入的variable发生变化时，同步更新本地状态
	useEffect(() => {
		if (variable) {
			// 更新选中的节点ID
			setSelectedNodeId(variable.nodeId || "");

			// 更新变量字符串
			if (variable.nodeId && variable.outputHandleId && variable.variable) {
				const variableString = generateOptionValue(
					variable.nodeId,
					variable.outputHandleId,
					variable.variable,
					variable.variableName,
				);
				setVariableString(variableString);
				console.log("variableString", variableString);
			} else {
				setVariableString("");
			}
		} else {
			// 如果variable为null，清空状态
			setSelectedNodeId("");
			setVariableString("");
		}
	}, [variable, generateOptionValue]);

	// 处理节点选择
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find((item) => item.nodeId === nodeId)?.nodeType;
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
		console.log("variableValue", variableValue);
		const [nodeId, outputHandleId, variableName, variable] = variableValue.split("|");
		console.log("variable", variable);
		console.log("variableName", variableName);
		console.log("outputHandleId", outputHandleId);
		console.log("nodeId", nodeId);
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === nodeId,
		);
		const selectedVar = selectedNode?.variables.find(
			(v) => v.outputHandleId === outputHandleId,
		);

		let variableId = 0;
		if (selectedVar) {
			variableId = selectedVar.configId;
			// if (isSelectedIndicator(selectedVar)) {
			// 	variableId = selectedVar.configId;
			// } else if (isSelectedSymbol(selectedVar)) {
			// 	variableId = selectedVar.configId;
			// } else if (isVariableConfig(selectedVar)) {
			// 	variableId = selectedVar.configId;
			// }
		}
		console.log("selectedVar", selectedVar);

		console.log("📊 变量选择:", {
			variableValue,
			parsed: { nodeId, handleId: outputHandleId, valueKey: variable },
			nodeName: selectedNode?.nodeName,
			variableType: selectedVar
				? isSelectedIndicator(selectedVar)
					? "indicator"
					: isSelectedSymbol(selectedVar)
						? "kline"
						: isVariableConfig(selectedVar)
							? "variable"
							: "unknown"
				: "unknown",
			variableId,
		});

		setVariableString(variableValue);
		onVariableChange(variableId, outputHandleId, variable, variableName);
	};

	// 获取选中节点的变量列表
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		return selectedNode?.variables || [];
	};

	// 获取指标选项
	const getIndicatorOption = (indicators: SelectedIndicator[]) => {
		const result: React.ReactNode[] = [];

		const groupedByIndicatorId = indicators.reduce(
			(groups, variable) => {
				const key = variable.configId;
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(variable);
				return groups;
			},
			{} as Record<number, SelectedIndicator[]>,
		);

		const indicatorIds = Object.keys(groupedByIndicatorId).map(Number).sort();

		indicatorIds.forEach((indicatorId, groupIndex) => {
			const variables = groupedByIndicatorId[indicatorId];

			// 创建指标组的所有选项
			const groupItems: React.ReactNode[] = [];

			// 添加每个指标的选项
			variables.forEach((variable) => {
				const variableName = Object.keys(variable.value);
				variableName.forEach((varName) => {
					if (varName === "timestamp") {
						return;
					}
					groupItems.push(
						<SelectItem
							className="text-xs font-normal py-2"
							key={`${variable.outputHandleId}_${varName}`}
							value={generateOptionValue(
								selectedNodeId,
								variable.outputHandleId,
								varName,
								t(`indicatorValueField.${varName}`),
							)}
							textValue={`指标${variable.configId} • ${varName}`}
						>
							<div className="flex items-center justify-between w-full gap-1">
								<Badge
									variant="outline"
									className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
								>
									{variable.indicatorType}
								</Badge>

								<span className="font-medium text-gray-900 text-right">
									{t(`indicatorValueField.${varName}`)}
								</span>
							</div>
						</SelectItem>,
					);
				});
			});

			// 用SelectGroup包装
			result.push(
				<SelectGroup key={`indicator_group_${indicatorId}`}>
					<SelectLabel className="text-xs font-semibold text-blue-600 px-2 py-1.5">
						指标 {indicatorId}
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			// 在不同指标ID组之间添加分隔符（除了最后一组）
			if (groupIndex < indicatorIds.length - 1) {
				result.push(
					<SelectSeparator
						key={`separator_${indicatorId}`}
						className="my-1"
					/>,
				);
			}
		});

		return result;
	};

	// 获取K线选项
	const getKlineOption = (klineNodes: SelectedSymbol[]) => {
		const result: React.ReactNode[] = [];

		const groupedByConfigId = klineNodes.reduce(
			(groups, variable) => {
				const key = variable.configId;
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(variable);
				return groups;
			},
			{} as Record<number, SelectedSymbol[]>,
		);

		const configIds = Object.keys(groupedByConfigId).map(Number).sort();

		configIds.forEach((configId, groupIndex) => {
			const variables = groupedByConfigId[configId];

			// 创建K线组的所有选项
			const groupItems: React.ReactNode[] = [];

			// 添加每个K线配置的选项
			variables.forEach((variable) => {
				const klineFields = ["open", "high", "low", "close", "volume"];

				klineFields.forEach((field) => {
					groupItems.push(
						<SelectItem
							className="text-xs font-normal py-2"
							key={`${variable.outputHandleId}_${field}`}
							value={generateOptionValue(
								selectedNodeId,
								variable.outputHandleId,
								field,
								t(`klineValueField.${field}`),
							)}
							textValue={`K线${variable.configId} • ${variable.symbol} ${variable.interval} • ${field}`}
						>
							<div className="flex items-center justify-between w-full gap-1">
								<Badge
									variant="outline"
									className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
								>
									{variable.symbol}|{variable.interval}
								</Badge>

								<span className="font-medium text-gray-900 text-right">
									{t(`klineValueField.${field}`)}
								</span>
							</div>
						</SelectItem>,
					);
				});
			});

			// 用SelectGroup包装
			result.push(
				<SelectGroup key={`kline_group_${configId}`}>
					<SelectLabel className="text-xs font-semibold text-green-600 px-2 py-1.5">
						K线 {configId}
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			// 在不同K线配置组之间添加分隔符（除了最后一组）
			if (groupIndex < configIds.length - 1) {
				result.push(
					<SelectSeparator
						key={`separator_${configId}`}
						className="my-1"
					/>,
				);
			}
		});

		return result;
	};

	// 获取变量节点选项
	const getVariableOption = (variableConfigs: GetVariableConfig[]) => {
		const result: React.ReactNode[] = [];
		const variableItems: React.ReactNode[] = [];

		variableConfigs.forEach((variable) => {
			variableItems.push(
				<SelectItem
					className="text-xs font-normal py-2 px-3 hover:bg-purple-50 focus:bg-purple-50"
					key={`${variable.outputHandleId}_${variable.varName}`}
					value={generateOptionValue(
						selectedNodeId,
						variable.outputHandleId,
						variable.varName,
						variable.varDisplayName,
					)}
					textValue={`${variable.varDisplayName} • ${variable.varName}`}
				>
					<div className="flex items-center justify-between w-full gap-2">
						<div className="flex items-center gap-2 flex-shrink-0">
							<Badge
								variant="outline"
								className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
							>
								{variable.symbol || t("IfElseNode.allSymbols")}
							</Badge>
						</div>
						<div className="flex flex-col items-end">
							<span className="text-xs text-gray-900 font-medium">
								{variable.varDisplayName}
							</span>
						</div>
					</div>
				</SelectItem>,
			);
		});

		result.push(
			<SelectGroup key="variable_group">
				{/* <SelectLabel className="text-xs font-semibold text-purple-600 px-2 py-1.5">
					变量数据
				</SelectLabel> */}
				{variableItems}
			</SelectGroup>,
		);

		return result;
	};

	// 渲染变量选项
	const renderVariableOptions = () => {
		const variables = getSelectedNodeVariables();
		if (variables.length === 0) return null;

		const indicators = variables.filter((v) =>
			isSelectedIndicator(v),
		) as SelectedIndicator[];
		const klineNodes = variables.filter((v) =>
			isSelectedSymbol(v),
		) as SelectedSymbol[];
		const variableConfigs = variables.filter((v) =>
			isVariableConfig(v),
		) as GetVariableConfig[];

		const result: React.ReactNode[] = [];

		// 处理指标节点
		if (indicators.length > 0) {
			result.push(...getIndicatorOption(indicators));
		}

		// 如果同时有指标和K线节点，在它们之间添加分隔符
		if (indicators.length > 0 && klineNodes.length > 0) {
			result.push(
				<SelectSeparator key="separator_indicator_kline" className="my-1" />,
			);
		}

		// 处理K线节点
		if (klineNodes.length > 0) {
			result.push(...getKlineOption(klineNodes));
		}

		// 如果同时有K线节点和变量节点，在它们之间添加分隔符
		if (
			(indicators.length > 0 || klineNodes.length > 0) &&
			variableConfigs.length > 0
		) {
			result.push(
				<SelectSeparator key="separator_kline_variable" className="my-1" />,
			);
		}

		// 处理变量节点
		if (variableConfigs.length > 0) {
			result.push(...getVariableOption(variableConfigs));
		}

		return result;
	};

	return (
		<div className="flex gap-2">
			{/* 节点选择器 */}
			<Select value={selectedNodeId} onValueChange={handleNodeChange}>
				<SelectTrigger
					className={cn("h-8 text-xs font-normal hover:bg-gray-200 min-w-20")}
				>
					<SelectValue placeholder={t("IfElseNode.selectNode")} className="truncate" />
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{variableItemList.map((item) => (
						<SelectItem
							key={item.nodeId}
							value={item.nodeId}
							className="text-xs font-normal py-2 px-3"
							textValue={item.nodeName}
						>
							<div className="flex items-center gap-1">
								{/* <Badge
									variant="outline"
									className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
								>
									{getNodeTypeDisplayName(item.nodeType)}
								</Badge> */}
								<span className="font-medium text-gray-900">
									{item.nodeName}
								</span>
							</div>
						</SelectItem>
					))}
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
						"h-8 text-xs font-normal hover:bg-gray-200 min-w-20",
						!selectedNodeId && "opacity-50 cursor-not-allowed",
					)}
				>
					<SelectValue placeholder={t("IfElseNode.selectVariable")} className="truncate" />
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{renderVariableOptions()}
				</SelectContent>
			</Select>
		</div>
	);
};

export default VariableSelector;
