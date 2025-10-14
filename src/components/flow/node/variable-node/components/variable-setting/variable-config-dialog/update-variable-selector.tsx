import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
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
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { VariableConfig, GetVariableConfig, UpdateOperationType } from "@/types/node/variable-node";
import { useTranslation } from "react-i18next";

interface UpdateVariableSelectorProps {
	variableItemList: VariableItem[];
	selectedNodeId: string | null;
	selectedHandleId: string | null;
	selectedVariable: string | null;
	selectedVariableName: string | null;
	updateOperationType: UpdateOperationType;
	availableOperations: UpdateOperationType[];
	onNodeChange: (nodeId: string, nodeType: NodeType | null, nodeName: string) => void;
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
	) => void;
	onOperationTypeChange: (operationType: UpdateOperationType) => void;
}

// 类型守卫
const isSelectedIndicator = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedIndicator => {
	return "value" in variable && "configId" in variable && "indicatorType" in variable;
};

const isSelectedSymbol = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedSymbol => {
	return "symbol" in variable && "interval" in variable && "configId" in variable;
};

const isGetVariableConfig = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is GetVariableConfig => {
	return "varOperation" in variable && variable.varOperation === "get";
};

const UpdateVariableSelector: React.FC<UpdateVariableSelectorProps> = ({
	variableItemList,
	selectedNodeId,
	selectedHandleId,
	selectedVariable,
	selectedVariableName,
	updateOperationType,
	availableOperations,
	onNodeChange,
	onVariableChange,
	onOperationTypeChange,
}) => {
	const [localNodeId, setLocalNodeId] = useState<string>(selectedNodeId || "");
	const [variableString, setVariableString] = useState<string>("");
	const { t } = useTranslation();

	// 获取操作类型的标签
	const getUpdateOperationLabel = (type: UpdateOperationType): string => {
		const labels: Record<UpdateOperationType, string> = {
			set: "=",
			add: "+",
			subtract: "-",
			multiply: "*",
			divide: "÷",
			max: "max",
			min: "min",
			toggle: "toggle",
		};
		return labels[type];
	};

	// 生成选项value，格式：nodeId|handleId|variable|variableName
	const generateOptionValue = useCallback(
		(nodeId: string, handleId: string, variable: string | number, variableName?: string | null) => {
			if (variableName) {
				return `${nodeId}|${handleId}|${variable}|${variableName}`;
			}
			return `${nodeId}|${handleId}||${variable}`;
		},
		[],
	);

	// 同步外部状态到本地状态
	useEffect(() => {
		if (selectedNodeId && selectedHandleId && selectedVariable) {
			setLocalNodeId(selectedNodeId);
			const variableString = generateOptionValue(
				selectedNodeId,
				selectedHandleId,
				selectedVariable,
				selectedVariableName,
			);
			setVariableString(variableString);
		} else {
			setLocalNodeId("");
			setVariableString("");
		}
	}, [selectedNodeId, selectedHandleId, selectedVariable, selectedVariableName, generateOptionValue]);

	// 处理节点选择
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find((item) => item.nodeId === nodeId)?.nodeType;
		const nodeName = variableItemList.find((item) => item.nodeId === nodeId)?.nodeName || "";
		setLocalNodeId(nodeId);
		setVariableString(""); // 清空变量选择
		onNodeChange(nodeId, nodeType || null, nodeName);
	};

	// 处理变量选择
	const handleVariableChange = (variableValue: string) => {
		const [nodeId, outputHandleId, variable, variableName] = variableValue.split("|");

		const selectedNode = variableItemList.find((item) => item.nodeId === nodeId);
		const selectedVar = selectedNode?.variables.find(
			(v) => v.outputHandleId === outputHandleId,
		);

		let variableId = 0;
		if (selectedVar) {
			variableId = selectedVar.configId;
		}

		setVariableString(variableValue);
		onVariableChange(variableId, outputHandleId, variable, variableName || variable);
	};

	// 获取选中节点的变量列表
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find((item) => item.nodeId === localNodeId);
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
			const groupItems: React.ReactNode[] = [];

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
								localNodeId,
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

			result.push(
				<SelectGroup key={`indicator_group_${indicatorId}`}>
					<SelectLabel className="text-xs font-semibold text-blue-600 px-2 py-1.5">
						指标 {indicatorId}
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			if (groupIndex < indicatorIds.length - 1) {
				result.push(
					<SelectSeparator key={`separator_${indicatorId}`} className="my-1" />,
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
			const groupItems: React.ReactNode[] = [];

			variables.forEach((variable) => {
				const klineFields = ["open", "high", "low", "close", "volume"];

				klineFields.forEach((field) => {
					groupItems.push(
						<SelectItem
							className="text-xs font-normal py-2"
							key={`${variable.outputHandleId}_${field}`}
							value={generateOptionValue(
								localNodeId,
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

			result.push(
				<SelectGroup key={`kline_group_${configId}`}>
					<SelectLabel className="text-xs font-semibold text-green-600 px-2 py-1.5">
						K线 {configId}
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			if (groupIndex < configIds.length - 1) {
				result.push(
					<SelectSeparator key={`separator_${configId}`} className="my-1" />,
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
					className="text-xs font-normal py-2 px-3"
					key={`${variable.outputHandleId}_${variable.varName}`}
					value={generateOptionValue(
						localNodeId,
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
			isGetVariableConfig(v),
		) as GetVariableConfig[];

		const result: React.ReactNode[] = [];

		if (indicators.length > 0) {
			result.push(...getIndicatorOption(indicators));
		}

		if (indicators.length > 0 && klineNodes.length > 0) {
			result.push(
				<SelectSeparator key="separator_indicator_kline" className="my-1" />,
			);
		}

		if (klineNodes.length > 0) {
			result.push(...getKlineOption(klineNodes));
		}

		if (
			(indicators.length > 0 || klineNodes.length > 0) &&
			variableConfigs.length > 0
		) {
			result.push(
				<SelectSeparator key="separator_kline_variable" className="my-1" />,
			);
		}

		if (variableConfigs.length > 0) {
			result.push(...getVariableOption(variableConfigs));
		}

		return result;
	};

	return (
		<ButtonGroup className="w-full">
			{/* 操作符选择器 */}
			<Select
				value={updateOperationType}
				onValueChange={(value: UpdateOperationType) => {
					onOperationTypeChange(value);
				}}
			>
				<SelectTrigger className="w-[64px] h-8">
					{getUpdateOperationLabel(updateOperationType)}
				</SelectTrigger>
				<SelectContent className="w-[64px] min-w-0">
					{availableOperations.map((op) => (
						<SelectItem key={op} value={op}>
							{getUpdateOperationLabel(op)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* 节点选择器 */}
			<Select value={localNodeId} onValueChange={handleNodeChange}>
				<SelectTrigger
					className={cn("h-8 text-xs font-normal hover:bg-gray-200 min-w-20 flex-1")}
				>
					<SelectValue placeholder="选择节点" className="truncate" />
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
				disabled={!localNodeId}
			>
				<SelectTrigger
					className={cn(
						"h-8 text-xs font-normal hover:bg-gray-200 min-w-20 flex-1",
						!localNodeId && "opacity-50 cursor-not-allowed",
					)}
				>
					<SelectValue placeholder="选择变量" className="truncate" />
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{renderVariableOptions()}
				</SelectContent>
			</Select>
		</ButtonGroup>
	);
};

export default UpdateVariableSelector;
