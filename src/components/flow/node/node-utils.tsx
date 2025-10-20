import { DateTime } from "luxon";
import type React from "react";
import {
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
} from "@/components/select-components/select-in-dialog";
import { Badge } from "@/components/ui/badge";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type {
	GetVariableConfig,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import { NodeType } from "@/types/node/index";

// 类型守卫
export const isSelectedIndicator = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedIndicator => {
	return (
		"value" in variable && "configId" in variable && "indicatorType" in variable
	);
};

export const isSelectedSymbol = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is SelectedSymbol => {
	return (
		"symbol" in variable && "interval" in variable && "configId" in variable
	);
};

export const isVariableConfig = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig,
): variable is VariableConfig => {
	return "varOperation" in variable && ["get", "update", "reset"].includes(variable.varOperation);
};

interface RenderVariableOptionsParams {
	variables: (SelectedIndicator | SelectedSymbol | VariableConfig)[];
	localNodeId: string;
	generateOptionValue: (
		nodeId: string,
		handleId: string,
		variable: string | number,
		variableName?: string | null,
	) => string;
	t: (key: string) => string;
	whitelistValueType?: VariableValueType | null; // 可选：白名单 - 只保留指定类型
	blacklistValueType?: VariableValueType | null; // 可选：黑名单 - 排除指定类型
	excludeVariable?: {
		// 可选：排除特定变量（用于避免变量与自身比较）
		nodeId: string;
		outputHandleId: string;
		varName: string | number;
	} | null;
}

/**
 * 渲染带分割线的变量选项
 * 支持指标节点、K线节点和变量节点
 */
export const renderVariableOptions = ({
	variables,
	localNodeId,
	generateOptionValue,
	t,
	whitelistValueType,
	blacklistValueType,
	excludeVariable,
}: RenderVariableOptionsParams): React.ReactNode[] | null => {
	if (variables.length === 0) return null;

	// 白名单过滤：如果指定了白名单类型，只保留该类型的变量
	let filteredVariables = variables;
	if (whitelistValueType) {
		filteredVariables = variables.filter((v) => {
			// 指标节点和K线节点都是 NUMBER 类型
			if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
				return whitelistValueType === VariableValueType.NUMBER;
			}
			// 变量节点根据其具体类型过滤
			if (isVariableConfig(v)) {
				return v.varValueType === whitelistValueType;
			}
			return false;
		});
	}

	// 黑名单过滤：如果指定了黑名单类型，排除该类型的变量
	if (blacklistValueType) {
		filteredVariables = filteredVariables.filter((v) => {
			// 指标节点和K线节点都是 NUMBER 类型
			if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
				return blacklistValueType !== VariableValueType.NUMBER;
			}
			// 变量节点根据其具体类型过滤
			if (isVariableConfig(v)) {
				return v.varValueType !== blacklistValueType;
			}
			return true;
		});
	}

	// 如果指定了排除变量，则进一步过滤
	if (excludeVariable) {
		filteredVariables = filteredVariables.filter((v) => {
			// 检查是否是需要排除的变量
			const shouldExclude =
				v.outputHandleId === excludeVariable.outputHandleId &&
				(() => {
					const excludeVarName = String(excludeVariable.varName);
					// 对于指标节点，检查是否是同一个变量字段
					if (isSelectedIndicator(v)) {
						return Object.keys(v.value).some((key) => key === excludeVarName);
					}
					// 对于K线节点，检查是否是同一个字段
					if (isSelectedSymbol(v)) {
						const klineFields = ["open", "high", "low", "close", "volume"];
						return klineFields.includes(excludeVarName);
					}
					// 对于变量节点，检查变量名
					if (isVariableConfig(v)) {
						return String(v.varName) === excludeVarName;
					}
					return false;
				})();

			return !shouldExclude;
		});
	}


	const indicators = filteredVariables.filter((v) =>
		isSelectedIndicator(v),
	) as SelectedIndicator[];
	const klineNodes = filteredVariables.filter((v) =>
		isSelectedSymbol(v),
	) as SelectedSymbol[];
	const variableConfigs = filteredVariables.filter((v) =>
		isVariableConfig(v),
	) as GetVariableConfig[];

	const result: React.ReactNode[] = [];

	// 渲染指标选项
	if (indicators.length > 0) {
		// 指标变量都是NUMBER类型
		const TypeIconComponent = getVariableValueTypeIcon(VariableValueType.NUMBER);
		const typeIconColor = getVariableValueTypeIconColor(VariableValueType.NUMBER);

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
						>
							<div className="flex items-center w-full gap-1">
								<div className="flex items-center gap-0.5 flex-shrink-0">
									<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
									<Badge
										variant="outline"
										className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
									>
										{variable.indicatorType}
									</Badge>
								</div>
								<span className="font-medium text-gray-900 flex-1 text-right truncate">
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
					<SelectSeparator
						key={`separator_indicator_${indicatorId}`}
						className="my-1"
					/>,
				);
			}
		});
	}

	// 指标和K线之间的分割线
	if (indicators.length > 0 && klineNodes.length > 0) {
		result.push(
			<SelectSeparator key="separator_indicator_kline" className="my-1" />,
		);
	}

	// 渲染K线选项
	if (klineNodes.length > 0) {
		// K线变量都是NUMBER类型
		const TypeIconComponent = getVariableValueTypeIcon(VariableValueType.NUMBER);
		const typeIconColor = getVariableValueTypeIconColor(VariableValueType.NUMBER);

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
						>
							<div className="flex items-center w-full gap-1">
								<div className="flex items-center gap-0.5 flex-shrink-0">
									<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
									<Badge
										variant="outline"
										className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
									>
										{variable.symbol}|{variable.interval}
									</Badge>
								</div>
								<span className="font-medium text-gray-900 flex-1 text-right truncate">
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
					<SelectSeparator
						key={`separator_kline_${configId}`}
						className="my-1"
					/>,
				);
			}
		});
	}

	// K线和变量之间的分割线
	if (
		(indicators.length > 0 || klineNodes.length > 0) &&
		variableConfigs.length > 0
	) {
		result.push(
			<SelectSeparator key="separator_kline_variable" className="my-1" />,
		);
	}

	// 渲染变量节点选项
	if (variableConfigs.length > 0) {
		const variableItems: React.ReactNode[] = [];

		variableConfigs.forEach((variable) => {
			// 获取变量类型图标和颜色
			const TypeIconComponent = getVariableValueTypeIcon(variable.varValueType);
			const typeIconColor = getVariableValueTypeIconColor(variable.varValueType);

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
				>
					<div className="flex items-center w-full gap-1">
						<div className="flex items-center gap-0.5 flex-shrink-0">
							<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
							{"symbol" in variable && variable.symbol && (
								<Badge
									variant="outline"
									className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
								>
									{variable.symbol}
								</Badge>
							)}
						</div>
						<span className="text-xs text-gray-900 font-medium flex-1 text-right truncate">
							{variable.varDisplayName}
						</span>
					</div>
				</SelectItem>,
			);
		});

		result.push(
			<SelectGroup key="variable_group">{variableItems}</SelectGroup>,
		);
	}

	return result;
};

/**
 * 渲染节点选项
 * 将 VariableItem 列表转换为 SelectInDialog 的 options 格式
 */
export const renderNodeOptions = (variableItemList: VariableItem[]) => {
	return variableItemList.map((item) => ({
		value: item.nodeId,
		label: (
			<div className="flex items-center gap-1">
				<span className="font-medium text-gray-900">{item.nodeName}</span>
			</div>
		),
	}));
};

export const formatDate = (date: Date | undefined): string => {
	if (!date) return "";
	return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm:ss ZZ") || "";
};





export const getNodeTypeLabel = (nodeType: NodeType | null, t: (key: string) => string) => {
	switch (nodeType) {
		case NodeType.KlineNode:
			return t("common.kline");
		case NodeType.IndicatorNode:
			return t("common.indicator");
		case NodeType.VariableNode:
			return t("common.variable");
		case NodeType.FuturesOrderNode:
			return t("common.order");
		default:
			return t("common.config");
	}
};