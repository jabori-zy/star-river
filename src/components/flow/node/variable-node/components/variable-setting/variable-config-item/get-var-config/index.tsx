import { TbFileImport } from "react-icons/tb";
import { Settings, User, ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DeleteConfigButton from "../../components/delete-config-button";
import {
	type ConditionTrigger,
	type GetVariableConfig,
	type TimerTrigger,
	type TriggerType,
	getConditionTriggerConfig,
	// getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	type CustomVariable,
	getSystemVariableMetadata,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	SystemVariableType,
	VariableValueType,
} from "@/types/variable";
import { useTranslation } from "react-i18next";
import { useCustomSysVariableName } from "@/store/use-custom-sys-variable-name";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generateStringHint,
	generateTimeHint,
	generatePercentageHint,
} from "../../../../hint-generators";
import SymbolSelector from "../../components/symbol-selector";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import type { SymbolSelectorOption } from "../../components/symbol-selector";
import type { CaseItemInfo } from "../../components/trigger-type-switcher/case-selector";
import { useValidateGetConfig } from "../validate";
import { useNodeConnections } from "@xyflow/react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { TradeMode } from "@/types/strategy";
import useTradingModeStore from "@/store/use-trading-mode-store";


interface GetVarConfigItemProps {
	id: string;
	config: GetVariableConfig;
	onConfigChange: (config: GetVariableConfig) => void;
	onDelete: () => void;
	customVariables: CustomVariable[];
	symbolOptions: SymbolSelectorOption[];
	symbolPlaceholder: string;
	symbolEmptyMessage: string;
	isSymbolSelectorDisabled: boolean;
	duplicateOperation?: string | null;
}

const GetVarConfigItem: React.FC<GetVarConfigItemProps> = ({
	id,
	config,
	onConfigChange,
	onDelete,
	customVariables,
	symbolOptions,
	symbolPlaceholder,
	symbolEmptyMessage,
	isSymbolSelectorDisabled,
	duplicateOperation,
}) => {
	const { t } = useTranslation();
	const { getCustomName, setCustomName, customNames } = useCustomSysVariableName();
	const [isOpen, setIsOpen] = useState(true);
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	const effectiveTriggerType =
		getEffectiveTriggerType(config) ?? "condition";
	const triggerCase = getConditionTriggerConfig(config) ?? null;
	const timerConfig = getTimerTriggerConfig(config);
	// const dataflowConfig = getDataFlowTriggerConfig(config);

	// 使用 ref 缓存 timer 和 condition 配置，防止切换触发类型时丢失
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" }
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);

	// 获取当前节点的连接信息
	// 从 config.inputHandleId 中提取节点 ID
	// 格式: variable_node_1763022786201_1piowqt_input_1
	const connections = useNodeConnections({ id, handleType: "target" });

	// 存储上游节点的case列表
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);

	// 获取上游节点的 case 列表
	useEffect(() => {
		// filter default input handle connection
		const conn = connections.filter(
			connection => (connection.targetHandle === `${id}_default_input` || connection.targetHandle === config.inputHandleId)
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);
	}, [connections, getIfElseNodeCases, id, tradingMode, config.inputHandleId]);

	// 当从 props 接收到新的配置时，更新缓存
	useEffect(() => {
		if (timerConfig) {
			cachedTimerConfig.current = timerConfig;
		}
	}, [timerConfig]);

	useEffect(() => {
		if (triggerCase) {
			cachedConditionConfig.current = triggerCase;
		}
	}, [triggerCase]);

	// 判断当前选中的变量是否是系统变量
	const isSystemVariable = config.varName
		? Object.values(SystemVariableType).includes(config.varName as SystemVariableType)
		: false;

	// 监听 store 中系统变量自定义名称的变化，实时更新 varDisplayName
	useEffect(() => {
		if (isSystemVariable && config.varName) {
			const customName = getCustomName(config.varName);
			if (customName && customName !== config.varDisplayName) {
				onConfigChange({
					...config,
					varDisplayName: customName,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config, getCustomName, onConfigChange, isSystemVariable]);

	// 判断当前选中的变量是否需要选择交易对
	const shouldShowSymbolSelector =
		!!config.varName &&
		isSystemVariable &&
		(Object.values(SystemVariableType).includes(config.varName as SystemVariableType)
			? getSystemVariableMetadata(t)[config.varName as SystemVariableType]?.shouldSelectSymbol ?? false
			: false);

	// 使用验证 Hook
	const { variable, symbol, triggerCase: triggerCaseError, hasError } = useValidateGetConfig(config, {
		t,
		duplicateOperation,
		shouldShowSymbolSelector,
		hasSymbol: "symbol" in config && !!config.symbol,
	});

	// 组装错误对象供 UI 使用
	const errors = { variable, symbol, triggerCase: triggerCaseError };

	// 处理变量选择变化
	const handleVariableChange = (varName: string) => {
		// 判断是自定义变量还是系统变量
		const isCustomVar = customVariables.some((v) => v.varName === varName);
		const isSystemVar = Object.values(SystemVariableType).includes(varName as SystemVariableType);

		if (isCustomVar) {
			// 自定义变量
			const selectedVar = customVariables.find((v) => v.varName === varName);
			if (selectedVar) {
				// 构建新的自定义变量配置，只包含必要字段
				const newConfig: GetVariableConfig = {
					configId: config.configId,
					inputHandleId: config.inputHandleId,
					outputHandleId: config.outputHandleId,
					varOperation: "get",
					varType: "custom",
					varName: selectedVar.varName,
					varDisplayName: selectedVar.varDisplayName,
					varValueType: selectedVar.varValueType,
					varValue: config.varValue,
					triggerConfig: config.triggerConfig,
				};
				onConfigChange(newConfig);
			}
		} else if (isSystemVar) {
			// 系统变量
			const metadata = getSystemVariableMetadata(t)[varName as SystemVariableType];
			// 从 store 加载自定义名称
			const customName = getCustomName(varName);

			// 获取当前的 symbol 值（如果存在）
			const currentSymbol = "symbol" in config ? config.symbol : null;

			const newConfig: GetVariableConfig = {
				configId: config.configId,
				inputHandleId: config.inputHandleId,
				outputHandleId: config.outputHandleId,
				varOperation: "get",
				varType: "system",
				varName: metadata.varName,
				varDisplayName: customName || metadata.varDisplayName,
				varValueType: metadata.varValueType,
				varValue: config.varValue,
				triggerConfig: config.triggerConfig,
				symbol: metadata.shouldSelectSymbol ? currentSymbol || null : undefined,
			};
			onConfigChange(newConfig);
		}
	};

	// 处理交易对选择变化
	const handleSymbolChange = (symbol: string) => {
		if ("symbol" in config) {
			onConfigChange({
				...config,
				symbol: symbol || null,
			} as GetVariableConfig);
		}
	};

	// 处理自定义变量名称变化
	const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDisplayName = e.target.value;

		// 如果是系统变量,同时更新 store
		if (isSystemVariable && config.varName) {
			setCustomName(config.varName, newDisplayName);
		}

		onConfigChange({
			...config,
			varDisplayName: newDisplayName,
		});
	};

	// 处理触发条件变化
	const handleTriggerCaseChange = (
		nextTriggerCase: ConditionTrigger | null,
	) => {
		// 更新缓存
		cachedConditionConfig.current = nextTriggerCase;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: nextTriggerCase
				? {
						type: "condition",
						config: nextTriggerCase,
					}
				: null,
		});
	};

	// 处理定时器配置变化
	const handleTimerConfigChange = (nextTimerConfig: TimerTrigger) => {
		// 更新缓存
		cachedTimerConfig.current = nextTimerConfig;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: {
				type: "timer",
				config: nextTimerConfig,
			},
		});
	};

	// 处理触发类型变化
	const handleTriggerTypeChange = (triggerType: TriggerType) => {
		if (triggerType === "condition") {
			onConfigChange({
				...config,
				triggerConfig: cachedConditionConfig.current
					? {
							type: "condition",
							config: cachedConditionConfig.current,
						}
					: null,
			});
		} else if (triggerType === "timer") {
			onConfigChange({
				...config,
				triggerConfig: {
					type: "timer",
					config: cachedTimerConfig.current,
				},
			});
		} else {
			// get 操作当前不支持 dataflow，回退到清空触发配置
			onConfigChange({
				...config,
				triggerConfig: null,
			});
		}
	};
	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

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

	// const hint = getHintGenerator(config.varValueType)({
	// 	t,
	// 	varOperation: "get",
	// 	variableDisplayName: config.varDisplayName,
	// 	conditionTrigger: triggerCase,
	// 	timerTrigger: timerConfig,
	// 	dataflowTrigger: dataflowConfig,
	// 	symbol: ("symbol" in config ? config.symbol : null) || undefined,
	// });

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	// 生成混合变量选项：自定义变量在前，系统变量在后
	const mixedVariableOptions = [
		// 自定义变量选项
		...customVariables.map((customVar) => {
			const TypeIconComponent = getVariableValueTypeIcon(customVar.varValueType);
			const typeIconColor = getVariableValueTypeIconColor(customVar.varValueType);

			return {
				value: customVar.varName,
				label: (
					<div className="flex items-center gap-2">
						<User className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} flex-shrink-0`}
						/>
						<span>{customVar.varName}</span>
						{/* <span className="text-xs text-muted-foreground">
							({customVar.varName})
						</span> */}
					</div>
				),
				searchText: `${customVar.varDisplayName} ${customVar.varName}`,
			};
		}),
		// 系统变量选项
		...Object.values(SystemVariableType).map((sysVar) => {
			const metadata = getSystemVariableMetadata(t)[sysVar];
			const TypeIconComponent = getVariableValueTypeIcon(metadata.varValueType);
			const typeIconColor = getVariableValueTypeIconColor(metadata.varValueType);

			return {
				value: sysVar,
				label: (
					<div className="flex items-center gap-2">
						<Settings className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} flex-shrink-0`}
						/>
						<span>{metadata.varName}</span>
						{/* <span className="text-xs text-muted-foreground">
							({metadata.varName})
						</span> */}
					</div>
				),
				searchText: `${metadata.varDisplayName} ${metadata.varName}`,
			};
		}),
	];

	// 判断当前选中的变量是否是自定义变量
	const isCustomVariable = config.varName
		? customVariables.some((customVar) => customVar.varName === config.varName)
		: false;

	// 条件触发的提示文案
	const shouldShowConditionHint = () => {
		// 必须选择了触发条件
		if (!triggerCase) {
			return false;
		}
		// 如果需要交易对，必须选择了交易对
		if (shouldShowSymbolSelector && !("symbol" in config ? config.symbol : null)) {
			return false;
		}
		return true;
	};

	// 定时触发的提示文案
	const shouldShowTimerHint = () => {
		// 如果需要交易对，必须选择了交易对
		if (shouldShowSymbolSelector && !("symbol" in config ? config.symbol : null)) {
			return false;
		}
		return true;
	};

	const conditionHint =
		effectiveTriggerType === "condition" && config.varDisplayName && shouldShowConditionHint()
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "get",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: triggerCase,
					timerTrigger: undefined,
					dataflowTrigger: undefined,
					symbol: ("symbol" in config ? config.symbol : null) || undefined,
				})
			: null;

	const timerHint =
		effectiveTriggerType === "timer" && config.varDisplayName && shouldShowTimerHint()
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "get",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: undefined,
					timerTrigger: timerConfig,
					dataflowTrigger: undefined,
					symbol: ("symbol" in config ? config.symbol : null) || undefined,
				})
			: null;

	return (
		<div className={`group flex-1 space-y-2 p-3 rounded-md border bg-background ${hasError ? "border-red-500" : "border-border"}`}>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-start justify-between gap-2">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							{isOpen ? (
								<ChevronDown className="h-4 w-4 flex-shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									{/* 第一行：图标 + 操作标题 + 触发方式 */}
									<div className="flex items-center gap-2">
										<TbFileImport className="h-4 w-4 text-blue-600 flex-shrink-0" />
										<span className="text-sm font-medium">{t("variableNode.getVariable")}</span>
										<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
											<TriggerIcon className="h-3 w-3" />
											{typeInfo.label}
										</Badge>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<div className="flex items-center gap-1">
										<VarTypeIcon className={`text-sm ${varTypeIconColor}`} />
										<p>{config.varName}</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</CollapsibleTrigger>

					{/* 删除按钮 */}
					<DeleteConfigButton onDelete={onDelete} />
				</div>

				{/* Dialog 中的完整配置 UI */}
				<CollapsibleContent>
					<div className="flex flex-col gap-2 mt-2">
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="variable"
								className="text-sm font-medium pointer-events-none"
							>
								{t("variableNode.var")}
							</Label>
							<SelectWithSearch
								id="variable"
								value={config.varName}
								onValueChange={handleVariableChange}
								placeholder="选择变量"
								searchPlaceholder="搜索变量..."
								emptyMessage="未找到变量"
								options={mixedVariableOptions}
								className="shadow-none"
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">
									{errors.variable}
								</p>
							)}
						</div>

						{shouldShowSymbolSelector && (
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="symbol"
									className="text-sm font-medium pointer-events-none"
								>
									交易对
								</Label>
								<div className="w-full">
									<SymbolSelector
										options={symbolOptions}
										value={("symbol" in config ? config.symbol : null) || ""}
										onChange={handleSymbolChange}
										placeholder={symbolPlaceholder}
										emptyMessage={symbolEmptyMessage}
										disabled={isSymbolSelectorDisabled}
									/>
								</div>
								{errors.symbol && (
									<p className="text-xs text-red-600 mt-1">
										{errors.symbol}
									</p>
								)}
							</div>
						)}

						{!isCustomVariable && (
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="variableName"
									className="text-sm font-medium pointer-events-none"
								>
									{t("variableNode.customVariableName")}
								</Label>
								<Input
									id="variableName"
									type="text"
									value={config.varDisplayName}
									onChange={handleDisplayNameChange}
									placeholder="输入变量名称"
									className="w-full"
								/>
							</div>
						)}

						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							availableTriggers={["condition", "timer"]}
							idPrefix="get"
							caseItemList={caseItemList}
							selectedTriggerCase={triggerCase ?? null}
							onTriggerCaseChange={handleTriggerCaseChange}
							timerConfig={timerConfig || { mode: "interval", interval: 1, unit: "hour" }}
							onTimerConfigChange={handleTimerConfigChange}
						/>

						{errors.triggerCase && (
							<p className="text-xs text-red-600 mt-1">
								{errors.triggerCase}
							</p>
						)}

						{/* 展开状态下显示描述文案 */}
						{effectiveTriggerType === "condition" && conditionHint && (
							<p className="text-xs text-muted-foreground mt-2">{conditionHint}</p>
						)}

						{effectiveTriggerType === "timer" && timerHint && (
							<p className="text-xs text-muted-foreground mt-2">{timerHint}</p>
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* 折叠状态下显示描述文案 */}
			{!isOpen && (
				<>
					{effectiveTriggerType === "condition" && conditionHint && (
						<p className="text-xs text-muted-foreground">{conditionHint}</p>
					)}

					{effectiveTriggerType === "timer" && timerHint && (
						<p className="text-xs text-muted-foreground">{timerHint}</p>
					)}
				</>
			)}
		</div>
	);
};

export default GetVarConfigItem;
